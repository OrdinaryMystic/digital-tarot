import { useState, useRef, useCallback } from 'react';
import { CardInstance } from '../types';

export interface UseCardInteractionReturn {
  isDragging: boolean;
  isRotating: boolean;
  dragStart: (e: React.MouseEvent | React.TouchEvent, card: CardInstance) => void;
  rotateStart: (e: React.MouseEvent | React.TouchEvent, card: CardInstance) => void;
  handleDoubleClick: (card: CardInstance, onFlip: (card: CardInstance) => void) => void;
  getDraggedCard: () => CardInstance | null;
}

export const useCardInteraction = (
  onCardUpdate: (card: CardInstance) => void,
  bringToFront: (cardId: string) => number,
  onDragEnd?: (e: MouseEvent, cardId: string) => void,
  zoom?: number,
  panOffset?: { x: number; y: number }
): UseCardInteractionReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const currentCardRef = useRef<CardInstance | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const cardStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const cardStartRotationRef = useRef<number>(0);
  const rotateStartAngleRef = useRef<number>(0);
  const cardCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastAngleRef = useRef<number>(0);
  const totalRotationDeltaRef = useRef<number>(0);
  const onCardUpdateRef = useRef(onCardUpdate);
  const bringToFrontRef = useRef(bringToFront);
  const onDragEndRef = useRef(onDragEnd);
  const latestZIndexRef = useRef<Map<string, number>>(new Map());
  const draggedCardIdRef = useRef<string | null>(null);
  const zoomRef = useRef(zoom ?? 1);
  const panOffsetRef = useRef(panOffset ?? { x: 0, y: 0 });
  const hasStartedDraggingRef = useRef(false);

  // Keep callback refs updated
  onCardUpdateRef.current = onCardUpdate;
  bringToFrontRef.current = bringToFront;
  onDragEndRef.current = onDragEnd;
  zoomRef.current = zoom ?? 1;
  panOffsetRef.current = panOffset ?? { x: 0, y: 0 };

  // Drag move handler (using refs to avoid closure issues)
  const dragMove = useCallback((e: MouseEvent | TouchEvent) => {
    const card = currentCardRef.current;
    if (!card || !dragStartPosRef.current || !cardStartPosRef.current) return;

    // Get client coordinates from either MouseEvent or TouchEvent
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;

    // Check if mouse has moved enough to be considered a drag (5px threshold)
    const dxScreen = Math.abs(clientX - dragStartPosRef.current.x);
    const dyScreen = Math.abs(clientY - dragStartPosRef.current.y);
    
    // Only set isDragging to true once we detect actual movement
    if (!hasStartedDraggingRef.current && (dxScreen > 5 || dyScreen > 5)) {
      hasStartedDraggingRef.current = true;
      setIsDragging(true);
    }

    // Convert mouse/touch coordinates to table-surface coordinates (accounting for zoom and pan)
    const currentTableX = (clientX - panOffsetRef.current.x) / zoomRef.current;
    const currentTableY = (clientY - panOffsetRef.current.y) / zoomRef.current;
    const startTableX = (dragStartPosRef.current.x - panOffsetRef.current.x) / zoomRef.current;
    const startTableY = (dragStartPosRef.current.y - panOffsetRef.current.y) / zoomRef.current;

    const dx = currentTableX - startTableX;
    const dy = currentTableY - startTableY;

    const newPosition = {
      x: cardStartPosRef.current.x + dx,
      y: cardStartPosRef.current.y + dy,
    };

    // Get the latest z-index from the map (set by bringToFront)
    const latestZIndex = latestZIndexRef.current.get(card.id) ?? card.zIndex;
    
    const updatedCard: CardInstance = {
      ...card,
      position: newPosition,
      zIndex: latestZIndex,
    };
    currentCardRef.current = updatedCard;
    onCardUpdateRef.current(updatedCard);
  }, []);

  // Drag end handler
  const dragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    const card = currentCardRef.current;
    const cardId = draggedCardIdRef.current;
    setIsDragging(false);
    hasStartedDraggingRef.current = false;
    currentCardRef.current = null;
    dragStartPosRef.current = null;
    cardStartPosRef.current = null;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
    
    // Call external drag end handler if provided (for deck drop detection)
    // Convert TouchEvent to MouseEvent-like object for compatibility
    if (onDragEndRef.current && card && cardId) {
      let clientX = 0;
      let clientY = 0;
      
      if (e instanceof MouseEvent) {
        // Regular mouse event - use coordinates directly
        clientX = e.clientX;
        clientY = e.clientY;
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        // Touch event - use changedTouches (available on touchend)
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if ('touches' in e && e.touches.length > 0) {
        // Touch event - fallback to touches if changedTouches not available
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      const mouseEvent = { clientX, clientY } as MouseEvent;
      onDragEndRef.current(mouseEvent, cardId);
    }
    
    draggedCardIdRef.current = null;
  }, [dragMove]);

  // Drag handlers
  const dragStart = useCallback((e: React.MouseEvent | React.TouchEvent, card: CardInstance) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Bring card to front when interaction starts and get the new z-index
    const newZIndex = bringToFrontRef.current(card.id);
    latestZIndexRef.current.set(card.id, newZIndex);
    draggedCardIdRef.current = card.id;
    
    // Don't set isDragging to true yet - wait until mouse actually moves
    // This prevents drop zones from appearing on simple clicks
    setIsDragging(false);
    hasStartedDraggingRef.current = false;
    currentCardRef.current = { ...card, zIndex: newZIndex };
    
    // Store mouse/touch position in screen coordinates (will be converted to table coords in dragMove)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPosRef.current = { x: clientX, y: clientY };
    cardStartPosRef.current = { ...card.position };
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
  }, [dragMove, dragEnd]);


  // Rotate move handler
  const rotateMove = useCallback((e: MouseEvent | TouchEvent) => {
    const card = currentCardRef.current;
    if (!card || !cardCenterRef.current) {
      return;
    }

    // Prevent default for touch to avoid scrolling
    if ('touches' in e) {
      e.preventDefault();
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Calculate angle from card center to current mouse position
    const dx = clientX - cardCenterRef.current.x;
    const dy = clientY - cardCenterRef.current.y;
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Calculate angle difference from last position
    let angleDiff = currentAngle - lastAngleRef.current;
    
    // Normalize angle difference to -180 to 180 range
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;
    
    // Accumulate the rotation delta
    totalRotationDeltaRef.current += angleDiff;
    
    // Update last angle for next calculation
    lastAngleRef.current = currentAngle;
    
    // Apply rotation with the accumulated difference
    const newRotation = cardStartRotationRef.current + totalRotationDeltaRef.current;
    
    // Get the latest z-index from the map (set by bringToFront)
    const latestZIndex = latestZIndexRef.current.get(card.id) ?? card.zIndex;
    
    const updatedCard: CardInstance = {
      ...card,
      rotation: newRotation,
      zIndex: latestZIndex,
    };
    currentCardRef.current = updatedCard;
    onCardUpdateRef.current(updatedCard);
  }, []);

  // Rotate end handler
  const rotateEnd = useCallback(() => {
    setIsRotating(false);
    currentCardRef.current = null;
    cardCenterRef.current = null;
    document.removeEventListener('mousemove', rotateMove);
    document.removeEventListener('mouseup', rotateEnd);
    document.removeEventListener('touchmove', rotateMove);
    document.removeEventListener('touchend', rotateEnd);
  }, [rotateMove]);

  // Rotate start handler
  const rotateStart = useCallback((e: React.MouseEvent | React.TouchEvent, card: CardInstance) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Bring card to front when interaction starts and get the new z-index
    const newZIndex = bringToFrontRef.current(card.id);
    latestZIndexRef.current.set(card.id, newZIndex);
    
    // Always clean up any existing rotation listeners first
    document.removeEventListener('mousemove', rotateMove);
    document.removeEventListener('mouseup', rotateEnd);
    document.removeEventListener('touchmove', rotateMove);
    document.removeEventListener('touchend', rotateEnd);
    
    setIsRotating(true);
    currentCardRef.current = { ...card, zIndex: newZIndex };
    cardStartRotationRef.current = card.rotation;
    totalRotationDeltaRef.current = 0; // Reset accumulated rotation

    // Calculate card center in screen coordinates using bounding box
    // This accounts for the card's current rotation and position
    const cardElement = (e.currentTarget as HTMLElement).closest('[data-card-id]');
    const rect = cardElement?.getBoundingClientRect();
    if (rect) {
      cardCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    } else {
      // Fallback: calculate from card position and dimensions
      // Convert table coordinates to screen coordinates
      const CARD_WIDTH = 140;
      const CARD_HEIGHT = 240;
      const centerTableX = card.position.x + CARD_WIDTH / 2;
      const centerTableY = card.position.y + CARD_HEIGHT / 2;
      
      // Convert to screen coordinates accounting for zoom and pan
      cardCenterRef.current = {
        x: centerTableX * zoomRef.current + panOffsetRef.current.x,
        y: centerTableY * zoomRef.current + panOffsetRef.current.y,
      };
    }

    // Calculate initial angle from card center to mouse/touch position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - cardCenterRef.current.x;
    const dy = clientY - cardCenterRef.current.y;
    const startAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    rotateStartAngleRef.current = startAngle;
    lastAngleRef.current = startAngle; // Initialize last angle
    
    document.addEventListener('mousemove', rotateMove);
    document.addEventListener('mouseup', rotateEnd);
    document.addEventListener('touchmove', rotateMove, { passive: false });
    document.addEventListener('touchend', rotateEnd);
  }, [rotateMove, rotateEnd]);

  // Double-click to flip
  const handleDoubleClick = useCallback((
    card: CardInstance,
    onFlip: (card: CardInstance) => void
  ) => {
    const flippedCard: CardInstance = {
      ...card,
      isFlipped: !card.isFlipped,
    };
    onFlip(flippedCard);
  }, []);

  const getDraggedCard = useCallback(() => {
    return currentCardRef.current;
  }, []);

  return {
    isDragging,
    isRotating,
    dragStart,
    rotateStart,
    handleDoubleClick,
    getDraggedCard,
  };
};

