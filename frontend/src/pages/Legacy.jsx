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
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const handleNodeHover = useCallback(node => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }

    const newHighlightNodes = new Set([node.id]);
    const newHighlightLinks = new Set();

    // Find connected nodes and links
    graphData.links.forEach(link => {
      if (link.source.id === node.id || link.target.id === node.id) {
        newHighlightLinks.add(link);
        newHighlightNodes.add(link.source.id === node.id ? link.target.id : link.source.id);
      }
    });

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, [graphData.links]);

  const fetchUserMatches = async (userId) => {
    const response = await fetch(`http://localhost:3000/api/matching/user/${userId}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.success) return null;
    
    return data.matches || [];
  };

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

      // Fetch current user's matches
      const userMatches = await fetchUserMatches(authUser.id);
      if (!userMatches) {
        throw new Error('Failed to load user matches');
      }

      // Initialize data structures
      const nodes = new Map();
      const links = new Set();
      const processedUsers = new Set();

      // Helper function to add a node
      const addNode = (user, isCurrentUser = false) => {
        if (!user) return;
        const nodeData = {
          id: user.id,
          name: user.name || 'Anonymous',
          isCurrentUser
        };
        nodes.set(user.id, nodeData);
      };

      // Helper function to add a link
      const addLink = (sourceId, targetId) => {
        const linkKey = [sourceId, targetId].sort().join('-');
        links.add({ source: sourceId, target: targetId, key: linkKey });
      };

      // Add current user
      addNode({ 
        id: authUser.id, 
        name: authUser.user_metadata?.full_name || 'You'
      }, true);

      // Process initial matches
      for (const match of userMatches) {
        const otherUser = match.user_a_id === authUser.id ? match.user_b : match.user_a;
        addNode(otherUser);
        addLink(authUser.id, otherUser.id);
        processedUsers.add(otherUser.id);
      }

      // Fetch and process secondary connections
      for (const userId of processedUsers) {
        if (userId === authUser.id) continue;
        
        const secondaryMatches = await fetchUserMatches(userId);
        if (!secondaryMatches) continue;

        for (const match of secondaryMatches) {
          const user1 = match.user_a;
          const user2 = match.user_b;
          
          addNode(user1);
          addNode(user2);
          addLink(user1.id, user2.id);
        }
      }

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
          nodeLabel="name"
          nodeColor={node => highlightNodes.has(node.id) ? '#ffffff' : '#aaaaaa'}
          nodeRelSize={6}
          linkWidth={link => highlightLinks.has(link) ? 2 : 1}
          linkColor={link => highlightLinks.has(link) ? '#ffffff' : '#666666'}
          backgroundColor="#020617"
          onNodeHover={handleNodeHover}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
        />
      </div>
    </div>
  );
}