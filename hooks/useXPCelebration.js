import { useState, useRef, useCallback, useEffect } from 'react';

// Thresholds for different celebration types
// Lowered to show celebrations more often for engagement
const CELEBRATION_THRESHOLDS = {
  QUICK: 10,      // Show quick popup (any small XP gain)
  NORMAL: 25,     // Show normal celebration (reflections, small actions)
  BIG: 50,        // Show big celebration (mastery moments, skills)
  EPIC: 100,      // Show epic celebration (trips, completing activities)
  LEGENDARY: 200, // Show legendary celebration (major achievements)
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

    const xpGained = currentXP - previousXP.current;
    const didLevelUp = currentLevel > previousLevel.current;

    // Level up always triggers a full celebration, even for 0 or small XP gains
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
    } else if (xpGained > 0) {
      // Regular XP gain without level up
      if (xpGained >= CELEBRATION_THRESHOLDS.NORMAL) {
        // Queue a full celebration
        celebrationQueue.current.push({
          type: 'full',
          xp: xpGained,
          celebrationType: getCelebrationType(xpGained),
          levelUp: false,
          newLevel: null,
        });
      } else if (xpGained >= CELEBRATION_THRESHOLDS.QUICK) {
        // Queue a quick popup
        celebrationQueue.current.push({
          type: 'quick',
          xp: xpGained,
        });
      }

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
      forceFull = false, // Force a full celebration even for small amounts
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
    } else if (xpAmount >= CELEBRATION_THRESHOLDS.NORMAL || forceFull || forceType) {
      // Show full celebration for larger amounts or if forced
      celebrationQueue.current.push({
        type: 'full',
        xp: xpAmount,
        celebrationType: forceType || getCelebrationType(xpAmount),
        levelUp: false,
        newLevel: null,
      });
    } else if (xpAmount >= CELEBRATION_THRESHOLDS.QUICK) {
      // Show quick popup for small amounts
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
    
    // Thresholds for reference
    CELEBRATION_THRESHOLDS,
  };
};

export default useXPCelebration;

