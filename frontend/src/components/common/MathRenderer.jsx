import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathRenderer component to handle mixed text and LaTeX content.
 * It detects LaTeX content wrapped in $...$ (inline) or $$...$$ (block).
 */
const MathRenderer = ({ content, block = false }) => {
    if (!content) return null;

    // If explicit block mode is requested for the entire content
    if (block) {
        return <BlockMath math={content} />;
    }

    // Regex to find LaTeX parts ($...$, $$...$$) OR markdown code blocks (```...```)
    const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|```[\s\S]+?```)/g);

    return (
        <span className="math-container">
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    const math = part.slice(2, -2);
                    return <BlockMath key={index} math={math} />;
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    const math = part.slice(1, -1);
                    return <InlineMath key={index} math={math} />;
                } else if (part.startsWith('```') && part.endsWith('```')) {
                    const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '').trim();
                    return (
                        <pre key={index} className="my-4 p-4 bg-gray-900 text-green-400 rounded-2xl overflow-x-auto font-mono text-sm leading-relaxed border border-gray-800 shadow-inner">
                            <code>{code}</code>
                        </pre>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default MathRenderer;
