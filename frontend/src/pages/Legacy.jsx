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

      // Fetch user's matches
      const response = await fetch(`http://localhost:3000/api/matching/user/${authUser.id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load connections');
      }

      // Transform matches into graph data
      const nodes = new Set();
      const links = [];
      
      // Add current user as first node
      nodes.add(JSON.stringify({
        id: authUser.id,
        name: authUser.user_metadata?.full_name || 'You',
        isCurrentUser: true
      }));

      // Process matches
      data.matches?.forEach(match => {
        const otherUser = match.user_a_id === authUser.id ? match.user_b : match.user_a;
        
        // Add other user as node
        nodes.add(JSON.stringify({
          id: otherUser.id,
          name: otherUser.name || 'Anonymous',
          isCurrentUser: false
        }));

        // Add connection as link
        links.push({
          source: authUser.id,
          target: otherUser.id
        });
      });

      setGraphData({
        nodes: Array.from(nodes).map(n => JSON.parse(n)),
        links
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