import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ForceGraph2D from 'react-force-graph-2d';

const ZOOM_TO_FIT_DURATION = 700;
const ZOOM_TO_FIT_PADDING = 240;

export default function Legacy() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [user, setUser] = useState(null);
  const [firstDegreeNodes, setFirstDegreeNodes] = useState(new Set());
  const [secondDegreeNodes, setSecondDegreeNodes] = useState(new Set());
  const [thirdDegreeNodes, setThirdDegreeNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Map()); // Map to store link degrees
  const [hoveredNode, setHoveredNode] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const graphRef = useRef(null);
  const containerRef = useRef(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const calculateConnections = useCallback((node) => {
    const first = new Set([node.id]);
    const second = new Set();
    const third = new Set();
    const links = new Map();

    // Find first-degree connections
    graphData.links.forEach(link => {
      const sourceId = link.source.id ?? link.source;
      const targetId = link.target.id ?? link.target;
      
      if (sourceId === node.id || targetId === node.id) {
        const connectedId = sourceId === node.id ? targetId : sourceId;
        first.add(connectedId);
        links.set(link, 1); // 1 for first-degree links
      }
    });

    // Find second-degree connections
    graphData.links.forEach(link => {
      const sourceId = link.source.id ?? link.source;
      const targetId = link.target.id ?? link.target;
      
      if (first.has(sourceId) && !first.has(targetId)) {
        second.add(targetId);
        links.set(link, 2); // 2 for second-degree links
      } else if (first.has(targetId) && !first.has(sourceId)) {
        second.add(sourceId);
        links.set(link, 2);
      }
    });

    // Find third-degree connections
    graphData.links.forEach(link => {
      const sourceId = link.source.id ?? link.source;
      const targetId = link.target.id ?? link.target;
      
      if (second.has(sourceId) && !first.has(targetId) && !second.has(targetId)) {
        third.add(targetId);
        links.set(link, 3); // 3 for third-degree links
      } else if (second.has(targetId) && !first.has(sourceId) && !second.has(sourceId)) {
        third.add(sourceId);
        links.set(link, 3);
      }
    });

    setFirstDegreeNodes(first);
    setSecondDegreeNodes(second);
    setThirdDegreeNodes(third);
    setHighlightLinks(links);
  }, [graphData.links]);

  const handleNodeClick = useCallback(node => {
    if (node) {
      navigate(`/profile/${node.id}`);
    }
  }, [navigate]);

  const handleNodeHover = useCallback(node => {
    // When unhovering, default back to the current user's node
    setHoveredNode(node ? node.id : currentUserId);
    
    if (!node) {
      // When unhovering, calculate connections for the current user
      const currentUserNode = { id: currentUserId };
      calculateConnections(currentUserNode);
      return;
    }

    calculateConnections(node);
  }, [calculateConnections, currentUserId]);

  const loadUserAndConnections = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast.error('Please log in');
        navigate('/login');
        return;
      }

      setUser(authUser);
      setCurrentUserId(authUser.id);
      // Initially set the hover to the current user's node
      setHoveredNode(authUser.id);

      // Fetch network data with one optimized query
      const response = await fetch(`http://localhost:3000/api/network/${authUser.id}?depth=3`);
      if (!response.ok) {
        throw new Error('Failed to load network data');
      }
      
      const { success, network } = await response.json();
      if (!success) {
        throw new Error('Failed to load network data');
      }

      // Process network data
      const nodes = new Map();
      const links = new Set();
      
      // Add current user first
      nodes.set(authUser.id, {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || 'You',
        isCurrentUser: true
      });

      // Process all connections
      network.forEach(connection => {
        // Add both users as nodes
        nodes.set(connection.user_a_id, {
          id: connection.user_a_id,
          name: connection.user_a_name || 'Anonymous',
          isCurrentUser: connection.user_a_id === authUser.id,
          depth: connection.depth
        });

        nodes.set(connection.user_b_id, {
          id: connection.user_b_id,
          name: connection.user_b_name || 'Anonymous',
          isCurrentUser: connection.user_b_id === authUser.id,
          depth: connection.depth
        });

        // Add connection as link
        links.add({
          source: connection.user_a_id,
          target: connection.user_b_id,
          depth: connection.depth
        });
      });

      // Transform data for ForceGraph2D
      const formattedGraph = {
        nodes: Array.from(nodes.values()),
        links: Array.from(links).map(({ source, target }) => ({ source, target }))
      };

      setGraphData(formattedGraph);
      setHasCentered(false);

    } catch (err) {
      console.error('Error loading connections:', err);
      setError(err.message);
      toast.error('Failed to load connections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndConnections();
  }, []);

  // Calculate initial connections when graph data and current user are loaded
  useEffect(() => {
    if (graphData.nodes.length > 0 && currentUserId) {
      const currentUserNode = graphData.nodes.find(node => node.id === currentUserId);
      if (currentUserNode) {
        calculateConnections(currentUserNode);
      }
    }
  }, [graphData.nodes.length, currentUserId, calculateConnections]);

  const applyInitialView = useCallback(() => {
    const fg = graphRef.current;
    if (!fg) return;

    try {
      const { width, height } = containerRef.current?.getBoundingClientRect() ?? {
        width: 0,
        height: 0
      };

      const dynamicPadding = width && height
        ? Math.max(width, height) * 0.18
        : ZOOM_TO_FIT_PADDING;

      fg.zoomToFit(ZOOM_TO_FIT_DURATION, dynamicPadding);
      setHasCentered(true);
    } catch (fitError) {
      console.warn('Unable to zoom to fit legacy graph:', fitError);
    }
  }, []);

  useEffect(() => {
    if (!graphRef.current || !graphData.nodes?.length || hasCentered) return;

    const rafId = requestAnimationFrame(applyInitialView);
    const timeoutId = window.setTimeout(() => {
      if (!hasCentered) {
        requestAnimationFrame(applyInitialView);
      }
    }, 800);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [graphData, hasCentered, applyInitialView]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-lg text-slate-100">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
  <div className="mx-auto flex w-full max-w-none flex-col items-center gap-6 px-4 py-10">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 text-4xl font-bold drop-shadow">
          <span role="img" aria-label="Tree">🌳</span>
          <h1 className="bg-gradient-to-r from-emerald-200 via-lime-100 to-emerald-300 bg-clip-text font-semibold tracking-wide text-transparent">
            Legacy Tree
          </h1>
          <span role="img" aria-label="Tree">🌳</span>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="group relative inline-flex items-center">
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
              aria-label="Learn about the legacy tree"
            >
              ?
            </button>
            <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
              What is my legacy tree?
            </span>
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="legacy-graph-container relative h-[70vh] w-full overflow-hidden rounded-2xl border-2 border-white/40 bg-gradient-to-br from-white/50 via-emerald-200/70 to-lime-200/70 shadow-lg"
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeRelSize={6}
          backgroundColor="transparent"
          style={{ width: '100%', height: '100%' }}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          nodeLabel={null}
          onEngineStop={() => {
            requestAnimationFrame(applyInitialView);
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const isCurrentUser = node.isCurrentUser === true;
            
            // Determine node size
            let size;
            if (hoveredNode === node.id) {
              size = 12; // hovered node
            } else if (isCurrentUser && !hoveredNode) {
              size = 12; // current user's node when no other node is hovered
            } else {
              size = 8; // default size
            }

            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
            
            // Color based on connection degree
            let fillColor;
            if (hoveredNode === node.id) {
              fillColor = '#ffffff'; // hovered node
            } else if (firstDegreeNodes.has(node.id)) {
              fillColor = '#ffffff'; // first degree connections
            } else if (secondDegreeNodes.has(node.id)) {
              fillColor = '#60746F'; // second degree connections
            } else if (thirdDegreeNodes.has(node.id)) {
              fillColor = '#0F352B'; // third degree connections
            } else if (isCurrentUser && !hoveredNode) {
              fillColor = '#ffffff'; // current user when no hover
            } else {
              fillColor = '#aaaaaa'; // default color
            }
            
            ctx.fillStyle = fillColor;
            ctx.fill();

            // Show label for hovered node or current user (when not hovering others)
            const shouldShowLabel = hoveredNode === node.id || (isCurrentUser && !hoveredNode);
            if (shouldShowLabel) {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#fff';
              ctx.fillText(label, node.x, node.y + size + fontSize);
            }
          }}
          linkColor={link => {
            const degree = highlightLinks.get(link);
            if (degree === 1) return '#ffffff';
            if (degree === 2) return '#60746F';
            if (degree === 3) return '#253937';
            return '#666666';
          }}
          linkWidth={link => highlightLinks.get(link) ? 2 : 1}
        />
      </div>
      <div className="max-w-2xl text-center">
        <p className="text-xl font-semibold text-white/90">See your impact</p>
        <p className="mt-3 text-base text-white/80">
          Watch your legacy tree grow with each person you skillswap with.
        </p>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-slate-900/95 p-6 text-left text-white shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-2xl font-semibold">What is the Legacy Tree?</h2>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-white/90">
              <p>
                Your legacy tree visualises every skill-sharing connection you make. Each node is a person you&apos;ve helped or learned from, and the branches show how knowledge ripples through the community.
              </p>
              <p>
                First-degree nodes are people you&apos;ve worked with directly. Second and third-degree nodes highlight how your impact extends beyond immediate collaborations as your partners continue sharing skills.
              </p>
              <p>
                Keep skillswapping to watch new branches form—your legacy grows every time you teach, learn, or introduce someone to the platform.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}