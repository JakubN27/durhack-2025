import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ForceGraph2D from 'react-force-graph-2d';

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
      setGraphData({
        nodes: Array.from(nodes.values()),
        links: Array.from(links).map(({ source, target }) => ({ source, target }))
      });

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
    <div className="flex flex-col h-[80vh] m-4">
      <h1 className="text-2xl mb-4 text-slate-100">Legacy View</h1>
      <div className="bg-primary-950 rounded-lg flex-1 overflow-hidden">
        <ForceGraph2D
          graphData={graphData}
          nodeRelSize={6}
          backgroundColor="#020617"
          onNodeHover={handleNodeHover}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          nodeLabel={null}
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
    </div>
  );
}