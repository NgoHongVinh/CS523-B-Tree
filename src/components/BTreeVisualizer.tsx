import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BTreeNode, BTreeKey } from '../lib/btree';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react';

interface BTreeVisualizerProps {
  root: BTreeNode;
  highlightNodeId?: string | null;
  highlightKeys?: string[];
}

const BTreeVisualizer: React.FC<BTreeVisualizerProps> = ({ root, highlightNodeId, highlightKeys }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1200;
    const height = 600;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const zoomContainer = svg.append('g').attr('class', 'zoom-container');
    const g = zoomContainer.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 5])
      .on('zoom', (event) => {
        zoomContainer.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoomBehavior);

    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(0.6);
    svg.call(zoomBehavior.transform, initialTransform);

    const handleZoomIn = () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
    const handleZoomOut = () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
    const handleReset = () => svg.transition().duration(500).call(zoomBehavior.transform, initialTransform);

    (window as any).btreeZoomIn = handleZoomIn;
    (window as any).btreeZoomOut = handleZoomOut;
    (window as any).btreeReset = handleReset;

    // Find max key length to determine keyWidth for this specific tree
    let maxLen = 0;
    const checkMaxLen = (node: BTreeNode) => {
      node.keys.forEach(k => {
        maxLen = Math.max(maxLen, k.key.length);
      });
      node.children.forEach(checkMaxLen);
    };
    checkMaxLen(root);

    // Dynamic key width: base 70px, + ~6px per char, max 280px
    const keyWidth = Math.min(280, Math.max(70, maxLen * 6.5 + 15));
    const keyHeight = 35;
    const nodeSpacing = 80; // Minimum horizontal gap between nodes

    const buildHierarchy = (node: BTreeNode): any => {
      return {
        id: node.id,
        keys: node.keys,
        children: node.children.map(buildHierarchy)
      };
    };

    const data = buildHierarchy(root);
    const hierarchy = d3.hierarchy(data);
    const leafCount = hierarchy.leaves().length;
    const depth = hierarchy.height;
    
    // Calculate dynamic width based on leaf count and key width
    // We use a more generous multiplier to ensure enough space for wide nodes
    const dynamicWidth = Math.max(width, leafCount * (keyWidth * 1.5 + nodeSpacing));
    const dynamicHeight = Math.max(height, (depth + 1) * 180);

    const treeLayout = d3.tree()
      .size([dynamicWidth - margin.left - margin.right, dynamicHeight - margin.top - margin.bottom])
      .separation((a: any, b: any) => {
        // Calculate separation based on the actual width of the nodes
        const aWidth = a.data.keys.length * keyWidth;
        const bWidth = b.data.keys.length * keyWidth;
        // The distance between centers should be at least (aWidth/2 + bWidth/2 + spacing)
        // D3 tree separation is a multiplier of the default spacing.
        // Default spacing is dynamicWidth / leafCount.
        const minDistance = (aWidth + bWidth) / 2 + nodeSpacing;
        const defaultSpacing = dynamicWidth / Math.max(1, leafCount);
        return Math.max(1, minDistance / defaultSpacing);
      });

    const nodes = treeLayout(hierarchy);

    g.selectAll('.link')
      .data(nodes.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y) as any)
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    const nodeGroup = g.selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodeGroup.each(function(d: any) {
      const node = d3.select(this);
      const keys = d.data.keys as BTreeKey[];
      const isHighlighted = d.data.id === highlightNodeId;
      const totalWidth = keys.length * keyWidth;

      node.append('rect')
        .attr('x', -totalWidth / 2 + 2)
        .attr('y', -keyHeight / 2 + 2)
        .attr('width', totalWidth)
        .attr('height', keyHeight)
        .attr('rx', 6)
        .attr('fill', 'rgba(0,0,0,0.05)');

      node.append('rect')
        .attr('x', -totalWidth / 2)
        .attr('y', -keyHeight / 2)
        .attr('width', totalWidth)
        .attr('height', keyHeight)
        .attr('rx', 6)
        .attr('fill', isHighlighted ? '#ecfdf5' : '#ffffff')
        .attr('stroke', isHighlighted ? '#10b981' : '#94a3b8')
        .attr('stroke-width', isHighlighted ? 3 : 1.5);

      keys.forEach((key, i) => {
        const x = -totalWidth / 2 + i * keyWidth;
        const keyIsHighlighted = highlightKeys?.includes(key.key);

        if (i > 0) {
          node.append('line')
            .attr('x1', x)
            .attr('y1', -keyHeight / 2)
            .attr('x2', x)
            .attr('y2', keyHeight / 2)
            .attr('stroke', '#e2e8f0');
        }

        const displayKey = key.key.length > 45 ? key.key.substring(0, 42) + '...' : key.key;

        node.append('text')
          .attr('x', x + keyWidth / 2)
          .attr('y', 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-family', '"STIX Two Text", serif')
          .attr('font-weight', keyIsHighlighted ? '700' : '500')
          .attr('fill', keyIsHighlighted ? '#065f46' : '#334155')
          .text(displayKey);
      });
    });
  }, [root, highlightNodeId, highlightKeys]);

  return (
    <div ref={containerRef} className="relative w-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group">
      {/* Zoom Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => (window as any).btreeZoomIn?.()}
          className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={() => (window as any).btreeZoomOut?.()}
          className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={() => (window as any).btreeReset?.()}
          className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 transition-colors"
          title="Reset View"
        >
          <Maximize size={18} />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest pointer-events-none">
        Thu phóng: {Math.round(zoomLevel * 100)}%
      </div>

      {/* Interaction Hint */}
      <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest pointer-events-none">
        <MousePointer2 size={12} /> Cuộn để thu phóng • Kéo để di chuyển
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 1200 600"
        className="w-full h-[500px] cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

export default BTreeVisualizer;
