import { motion } from 'framer-motion';

type GraphData = {
    subject: string;
    A: number;
    fullMark: number;
};

type KnowledgeGraphProps = {
    data: GraphData[];
};

export function KnowledgeGraph({ data }: KnowledgeGraphProps) {
    // 320px height, 100% width container defined in ProgressScreen
    // Let's use an SVG drawing area
    const width = 400;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100; // Radius for the satellite nodes

    const filteredData = data.filter(d => d.subject !== 'Unknown');
    const angleStep = (Math.PI * 2) / Math.max(1, filteredData.length);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Draw connections first so they are behind nodes */}
                {filteredData.map((d, i) => {
                    const angle = i * angleStep - Math.PI / 2; // Start from top
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    // Stroke opacity based on mastery
                    const masteryRatio = d.A / d.fullMark;
                    
                    return (
                        <motion.line
                            key={`line-${i}`}
                            x1={centerX}
                            y1={centerY}
                            x2={x}
                            y2={y}
                            stroke="var(--primary)"
                            strokeWidth={2}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.2 + (masteryRatio * 0.8) }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                        />
                    );
                })}

                {/* Draw satellite nodes */}
                {filteredData.map((d, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    
                    const masteryRatio = d.A / d.fullMark;
                    // Node size scales with mastery, min 10 max 24
                    const nodeRadius = 10 + (masteryRatio * 14);
                    // Color gets brighter based on mastery
                    const isMastered = masteryRatio >= 0.8;

                    return (
                        <g key={`node-${i}`}>
                            <motion.circle
                                cx={x}
                                cy={y}
                                r={nodeRadius}
                                fill={isMastered ? "var(--color-success)" : "var(--primary)"}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.2, filter: "brightness(1.5)" }}
                                transition={{ duration: 0.5, delay: 0.5 + i * 0.1, type: "spring" }}
                                style={{ cursor: 'pointer' }}
                            />
                            {/* Glowing aura for mastered nodes */}
                            {isMastered && (
                                <motion.circle
                                    cx={x}
                                    cy={y}
                                    r={nodeRadius + 4}
                                    fill="none"
                                    stroke="var(--color-success)"
                                    strokeWidth={2}
                                    initial={{ scale: 1, opacity: 0.8 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                            )}
                            <motion.text
                                x={x}
                                y={y + nodeRadius + 12}
                                textAnchor="middle"
                                fill="var(--text-muted)"
                                fontSize="10"
                                fontWeight="700"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 + i * 0.1 }}
                            >
                                {d.subject}
                            </motion.text>
                            <motion.text
                                x={x}
                                y={y + nodeRadius + 24}
                                textAnchor="middle"
                                fill="var(--text-base)"
                                fontSize="10"
                                fontWeight="800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 + i * 0.1 }}
                            >
                                {d.A}%
                            </motion.text>
                        </g>
                    );
                })}

                {/* Central Core Node */}
                <g>
                    <motion.circle
                        cx={centerX}
                        cy={centerY}
                        r={30}
                        fill="var(--bg-surface)"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                    />
                    <motion.circle
                        cx={centerX}
                        cy={centerY}
                        r={36}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth={1}
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                        strokeDasharray="4 4"
                    />
                    <text
                        x={centerX}
                        y={centerY + 4}
                        textAnchor="middle"
                        fill="var(--primary)"
                        fontSize="10"
                        fontWeight="900"
                        letterSpacing="1"
                    >
                        CORE
                    </text>
                </g>
            </svg>
        </div>
    );
}
