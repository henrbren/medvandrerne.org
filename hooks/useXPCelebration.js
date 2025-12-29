import { useState, useRef, useCallback, useEffect } from 'react';

// Thresholds for different celebration types
const CELEBRATION_THRESHOLDS = {
  QUICK: 1,       // Show quick popup for any XP gain
  NORMAL: 25,     // (Not used for automatic detection anymore)
  BIG: 50,        // (Not used for automatic detection anymore)
  EPIC: 100,      // (Not used for automatic detection anymore)
  LEGENDARY: 200, // (Not used for automatic detection anymore)
};

export const useXPCelebration = (currentXP, currentLevel) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationXP, setCelebrationXP] = useState(0);
  const [celebrationType, setCelebrationType] = useState('normal');
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [quickPopup, setQuickPopup] = useState({ visible: false, xp: 0, position: { x: 0, y: 0 } });
  
  const previousXP = useRef(currentXP);
  const previousLevel = useRef(currentLevel);
  const celebrationQueue = useRef([]);
  const isProcessing = useRef(false);
  const hasInitialized = useRef(false); // Skip first detection on screen load

  // Determine celebration type based on XP gained
  const getCelebrationType = (xpGained) => {
    if (xpGained >= CELEBRATION_THRESHOLDS.LEGENDARY) return 'legendary';
    if (xpGained >= CELEBRATION_THRESHOLDS.EPIC) return 'epic';
    if (xpGained >= CELEBRATION_THRESHOLDS.BIG) return 'big';
    return 'normal';
  };

  // Process the next celebration in the queue
  const processQueue = useCallback(() => {
    if (celebrationQueue.current.length === 0) {
      isProcessing.current = false;
      return;
    }

    isProcessing.current = true;
    const next = celebrationQueue.current.shift();

    if (next.type === 'quick') {
      setQuickPopup({
        visible: true,
        xp: next.xp,
        position: next.position || { x: 0, y: 0 },
      });
      // Auto-hide quick popup
      setTimeout(() => {
        setQuickPopup(prev => ({ ...prev, visible: false }));
        processQueue();
      }, 1500);
    } else {
      setCelebrationXP(next.xp);
      setCelebrationType(next.celebrationType);
      setLevelUp(next.levelUp);
      setNewLevel(next.newLevel);
      setShowCelebration(true);
    }
  }, []);

  // Track XP changes and queue celebrations
  useEffect(() => {
    if (currentXP === null || previousXP.current === null) {
      previousXP.current = currentXP;
      previousLevel.current = currentLevel;
      return;
    }

    // Skip the first detection after initialization to avoid showing
    // celebrations when the screen first loads
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      previousXP.current = currentXP;
      previousLevel.current = currentLevel;
      return;
    }

    const xpGained = currentXP - previousXP.current;
    const didLevelUp = currentLevel > previousLevel.current;
    const didLevelDown = currentLevel < previousLevel.current;

    // Ignore level/XP resets (e.g., when user resets data)
    if (didLevelDown || (xpGained < 0 && Math.abs(xpGained) > 100)) {
      // Level went down or XP dropped significantly - this is a reset, not a celebration
      previousXP.current = currentXP;
      previousLevel.current = currentLevel;
      return;
    }

    // Level up triggers a full celebration
    if (didLevelUp) {
      celebrationQueue.current.push({
        type: 'full',
        xp: xpGained > 0 ? xpGained : 0,
        celebrationType: 'epic', // Level ups are always epic
        levelUp: true,
        newLevel: currentLevel,
      });
      
      // Start processing if not already
      if (!isProcessing.current) {
        processQueue();
      }
    } else if (xpGained > 0 && xpGained >= CELEBRATION_THRESHOLDS.QUICK) {
      // Regular XP gain - only show quick popup (no full celebration)
      celebrationQueue.current.push({
        type: 'quick',
        xp: xpGained,
      });

      // Start processing if not already
      if (!isProcessing.current) {
        processQueue();
      }
    }

    previousXP.current = currentXP;
    previousLevel.current = currentLevel;
  }, [currentXP, currentLevel, processQueue]);

  // Manually trigger a celebration
  const triggerCelebration = useCallback((xpAmount, options = {}) => {
    const { 
      forceType, 
      levelUp: forceLevelUp, 
      newLevel: forceNewLevel, 
      position,
      forceFull = false, // Force a full celebration (only use for special occasions)
    } = options;

    // Level up always gets a full epic celebration
    if (forceLevelUp) {
      celebrationQueue.current.push({
        type: 'full',
        xp: xpAmount,
        celebrationType: forceType || 'epic',
        levelUp: true,
        newLevel: forceNewLevel,
      });
    } else if (forceFull || forceType) {
      // Only show full celebration if explicitly forced (for special occasions)
      celebrationQueue.current.push({
        type: 'full',
        xp: xpAmount,
        celebrationType: forceType || getCelebrationType(xpAmount),
        levelUp: false,
        newLevel: null,
      });
    } else if (xpAmount >= CELEBRATION_THRESHOLDS.QUICK) {
      // Default: show quick popup for XP gains
      celebrationQueue.current.push({
        type: 'quick',
        xp: xpAmount,
        position,
      });
    }

    if (!isProcessing.current) {
      processQueue();
    }
  }, [processQueue]);

  // Handle celebration complete
  const onCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setLevelUp(false);
    setNewLevel(null);
    // Process next in queue
    setTimeout(processQueue, 300);
  }, [processQueue]);

  // Dismiss celebration manually
  const dismissCelebration = useCallback(() => {
    onCelebrationComplete();
  }, [onCelebrationComplete]);

  // Reset celebration state (for use when resetting all data)
  const resetCelebrationState = useCallback(() => {
    celebrationQueue.current = [];
    isProcessing.current = false;
    hasInitialized.current = false;
    setShowCelebration(false);
    setCelebrationXP(0);
    setCelebrationType('normal');
    setLevelUp(false);
    setNewLevel(null);
    setQuickPopup({ visible: false, xp: 0, position: { x: 0, y: 0 } });
    previousXP.current = null;
    previousLevel.current = null;
  }, []);

  return {
    // State
    showCelebration,
    celebrationXP,
    celebrationType,
    levelUp,
    newLevel,
    quickPopup,
    
    // Actions
    triggerCelebration,
    onCelebrationComplete,
    dismissCelebration,
    resetCelebrationState,
    
    // Thresholds for reference
    CELEBRATION_THRESHOLDS,
  };
};

export default useXPCelebration;

