import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import './ScenarioLabsScreen.css';

type BlockInfo = {
    id: string;
    text: string;
    type: 'persona' | 'context' | 'task' | 'format';
};

const INITIAL_BLOCKS: BlockInfo[] = [
    { id: 'b1', text: 'Output only the raw code block without markdown formatting.', type: 'format' },
    { id: 'b2', text: 'Act as an expert Python software engineer.', type: 'persona' },
    { id: 'b3', text: 'Write a script to sort an array using merge sort.', type: 'task' },
    { id: 'b4', text: 'I am a computer science student studying algorithms.', type: 'context' }
];

type SlotsState = {
    persona: BlockInfo | null;
    context: BlockInfo | null;
    task: BlockInfo | null;
    format: BlockInfo | null;
};

export function ScenarioLabsScreen() {
    const [bankBlocks, setBankBlocks] = useState<BlockInfo[]>(INITIAL_BLOCKS);
    const [slots, setSlots] = useState<SlotsState>({
        persona: null,
        context: null,
        task: null,
        format: null
    });
    
    const [draggedBlockInfo, setDraggedBlockInfo] = useState<{ block: BlockInfo; sourceSlot?: keyof SlotsState } | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [activeDragOverSlot, setActiveDragOverSlot] = useState<keyof SlotsState | null>(null);
    const [feedback, setFeedback] = useState<{ status: 'success' | 'error', message: string } | null>(null);

    const handleDragStart = (block: BlockInfo, sourceSlot?: keyof SlotsState) => {
        setDraggedBlockInfo({ block, sourceSlot });
        setFeedback(null);
    };

    const getViewportCoords = (event: any, info: any) => {
        let x = event?.clientX;
        let y = event?.clientY;
        
        if (x === undefined || y === undefined) {
            if (event?.touches && event.touches.length > 0) {
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            } else if (event?.changedTouches && event.changedTouches.length > 0) {
                x = event.changedTouches[0].clientX;
                y = event.changedTouches[0].clientY;
            }
        }
        
        if (x === undefined || y === undefined) {
            x = info?.point?.x;
            y = info?.point?.y;
        }
        
        return { x, y };
    };

    const findSlotAtCoords = (clientX: number, clientY: number): keyof SlotsState | 'bank' | null => {
        const slotsElements = {
            persona: document.querySelector('[data-slot="persona"]'),
            context: document.querySelector('[data-slot="context"]'),
            task: document.querySelector('[data-slot="task"]'),
            format: document.querySelector('[data-slot="format"]'),
            bank: document.querySelector('[data-slot="bank"]')
        };

        for (const [key, el] of Object.entries(slotsElements)) {
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                return key as keyof SlotsState | 'bank';
            }
        }
        return null;
    };

    const handleDrag = (event: any, info: any) => {
        const { x: clientX, y: clientY } = getViewportCoords(event, info);
        if (clientX === undefined || clientY === undefined) return;
        
        const targetSlot = findSlotAtCoords(clientX, clientY);
        if (targetSlot && targetSlot !== 'bank') {
            setActiveDragOverSlot(targetSlot);
        } else {
            setActiveDragOverSlot(null);
        }
    };

    const handleDragEnd = (event: any, info: any) => {
        setActiveDragOverSlot(null);
        if (!draggedBlockInfo) return;

        const { x: clientX, y: clientY } = getViewportCoords(event, info);
        if (clientX === undefined || clientY === undefined) {
            setDraggedBlockInfo(null);
            return;
        }

        const targetSlot = findSlotAtCoords(clientX, clientY);

        if (!targetSlot) {
            setDraggedBlockInfo(null);
            return;
        }

        const { block, sourceSlot } = draggedBlockInfo;

        if (targetSlot === 'bank') {
            if (sourceSlot) {
                setSlots(prev => ({ ...prev, [sourceSlot]: null }));
                setBankBlocks(prev => {
                    if (prev.find(b => b.id === block.id)) return prev;
                    return [...prev, block];
                });
            }
        } else {
            // targetSlot is one of the four slots
            const currentTargetBlock = slots[targetSlot];
            setSlots(prev => ({ ...prev, [targetSlot]: block }));

            if (sourceSlot) {
                setSlots(prev => ({ ...prev, [sourceSlot]: currentTargetBlock }));
            } else {
                setBankBlocks(prev => {
                    const newBank = prev.filter(b => b.id !== block.id);
                    if (currentTargetBlock) newBank.push(currentTargetBlock);
                    return newBank;
                });
            }
        }

        setDraggedBlockInfo(null);
        setFeedback(null);
    };

    // --- CLICK-TO-SELECT FALLBACK (Remains fully functional) ---
    const handleBlockClick = (block: BlockInfo) => {
        if (selectedBlockId === block.id) {
            setSelectedBlockId(null);
        } else {
            setSelectedBlockId(block.id);
        }
    };

    const handleSlotClick = (targetSlot: keyof SlotsState) => {
        if (!selectedBlockId) return;

        let blockToMove = bankBlocks.find(b => b.id === selectedBlockId);
        let sourceSlot: keyof SlotsState | '' = '';

        if (!blockToMove) {
            for (const s of ['persona', 'context', 'task', 'format'] as const) {
                if (slots[s]?.id === selectedBlockId) {
                    blockToMove = slots[s]!;
                    sourceSlot = s;
                    break;
                }
            }
        }

        if (!blockToMove) return;

        const currentTargetBlock = slots[targetSlot];
        setSlots(prev => ({ ...prev, [targetSlot]: blockToMove }));

        if (sourceSlot) {
            setSlots(prev => ({ ...prev, [sourceSlot]: currentTargetBlock }));
        } else {
            setBankBlocks(prev => {
                const newBank = prev.filter(b => b.id !== selectedBlockId);
                if (currentTargetBlock) newBank.push(currentTargetBlock);
                return newBank;
            });
        }
        setSelectedBlockId(null);
        setFeedback(null);
    };

    const handleBankClick = () => {
        if (!selectedBlockId) return;
        
        let sourceSlot: keyof SlotsState | '' = '';
        let blockToMove: BlockInfo | null = null;
        for (const s of ['persona', 'context', 'task', 'format'] as const) {
            if (slots[s]?.id === selectedBlockId) {
                blockToMove = slots[s];
                sourceSlot = s;
                break;
            }
        }

        if (blockToMove && sourceSlot) {
            setSlots(prev => ({ ...prev, [sourceSlot]: null }));
            setBankBlocks(prev => [...prev, blockToMove!]);
            setSelectedBlockId(null);
            setFeedback(null);
        }
    };

    const handleEvaluate = () => {
        if (!slots.persona || !slots.context || !slots.task || !slots.format) {
            setFeedback({ status: 'error', message: 'All prompt slots must be filled before evaluation.' });
            return;
        }

        // Logic: Persona -> Context -> Task -> Format
        const isCorrect = 
            slots.persona.type === 'persona' &&
            slots.context.type === 'context' &&
            slots.task.type === 'task' &&
            slots.format.type === 'format';

        if (isCorrect) {
            setFeedback({ status: 'success', message: 'EXCELLENT. Optimum prompt structure achieved.' });
        } else {
            setFeedback({ status: 'error', message: 'SUBOPTIMAL. Review prompt structure best practices and try again.' });
        }
    };

    const isComplete = slots.persona && slots.context && slots.task && slots.format;

    return (
        <motion.div 
            className="page-container labs-root"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <header className="lab-header">
                <span className="hud-label" style={{ color: 'var(--primary)' }}>SCENARIO LABS // PROMPT ASSEMBLY</span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>Construct Optimal Prompt</h1>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                    Drag the cognitive blocks from the memory bank into the assembly slots below to form the perfect prompt.
                </p>
            </header>

            <div className="lab-workspace">
                <div 
                    className="blocks-bank"
                    data-slot="bank"
                >
                    <div className="chart-hud-header">
                        <div className="chart-title">MEMORY BANK</div>
                        <Zap size={16} className="text-muted" />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        {bankBlocks.map(block => (
                            <motion.div
                                key={block.id}
                                drag
                                dragSnapToOrigin={true}
                                dragElastic={0.6}
                                dragMomentum={false}
                                onDragStart={() => handleDragStart(block)}
                                onDrag={handleDrag}
                                onDragEnd={handleDragEnd}
                                whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}
                                onClick={(e) => { e.stopPropagation(); handleBlockClick(block); }}
                                className={`prompt-block ${selectedBlockId === block.id ? 'selected' : ''}`}
                                style={selectedBlockId === block.id ? { borderColor: 'var(--primary)', boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.3)' } : {}}
                            >
                                {block.text}
                            </motion.div>
                        ))}
                        {bankBlocks.length === 0 && (
                            <div className="text-muted text-small flex-center" onClick={handleBankClick} style={{ minHeight: '100px', border: '1px dashed var(--border-subtle)', borderRadius: '8px', cursor: 'pointer' }}>
                                Click here with a block selected to return it to the bank.
                            </div>
                        )}
                    </div>
                </div>

                <div className="prompt-builder">
                    {(['persona', 'context', 'task', 'format'] as const).map(slotType => {
                        const block = slots[slotType];
                        return (
                            <div 
                                key={slotType}
                                className={`drop-slot ${block ? 'filled' : ''} ${activeDragOverSlot === slotType ? 'drag-over' : ''}`}
                                data-slot={slotType}
                            >
                                <span className="slot-label">{slotType.toUpperCase()}</span>
                                {block ? (
                                    <motion.div
                                        drag
                                        dragSnapToOrigin={true}
                                        dragElastic={0.6}
                                        dragMomentum={false}
                                        onDragStart={() => handleDragStart(block, slotType)}
                                        onDrag={handleDrag}
                                        onDragEnd={handleDragEnd}
                                        whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}
                                        onClick={(e) => { e.stopPropagation(); handleBlockClick(block); }}
                                        className={`prompt-block ${selectedBlockId === block.id ? 'selected' : ''}`}
                                        style={selectedBlockId === block.id ? { borderColor: 'var(--primary)', boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.3)' } : {}}
                                    >
                                        {block.text}
                                    </motion.div>
                                ) : (
                                    <div 
                                        className="text-muted text-small" 
                                        onClick={() => handleSlotClick(slotType)}
                                        style={{ opacity: 0.5, marginTop: '1rem', height: '100%', width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                    >
                                        Drop or click here to place block
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="lab-actions">
                <button 
                    className="btn-evaluate" 
                    onClick={handleEvaluate}
                    disabled={!isComplete}
                >
                    EVALUATE STRUCTURE
                </button>
            </div>

            {feedback && (
                <motion.div 
                    className={`lab-feedback ${feedback.status}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {feedback.status === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                    <span>{feedback.message}</span>
                </motion.div>
            )}
        </motion.div>
    );
}
