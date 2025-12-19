
import React, { useMemo } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export const Card = ({ title, children, className = "" }) => html`
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 dark:border-slate-700 ${className}">
        ${title && html`<div class="px-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 font-bold text-gray-700 dark:text-slate-200 text-xs md:text-sm shrink-0">${title}</div>`}
        <div class="p-2 md:p-3 flex-1 overflow-auto flex flex-col text-gray-800 dark:text-slate-300 text-sm md:text-base">
            ${children}
        </div>
    </div>
`;

/**
 * 紙吹雪コンポーネント
 */
export const SimpleConfetti = () => {
    const pieces = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100 + '%';
            const animationDelay = Math.random() * 0.5 + 's';
            const bgColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
            const color = bgColors[Math.floor(Math.random() * bgColors.length)];
            return { id: i, left, animationDelay, color };
        });
    }, []);

    return html`
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-50">
            ${pieces.map(p => html`
                <div key=${p.id} class="confetti-piece" style=${{ left: p.left, animationDelay: p.animationDelay, backgroundColor: p.color }}></div>
            `)}
        </div>
    `;
};
