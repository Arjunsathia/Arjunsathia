// While a popup is open, the page behind it is moving, hidden or dimmed, so the live canvases (the contact ribbons,
// the hero's 3D card, the stack gallery) stop drawing and leave the phone's graphics chip to the popup's animation.
// They pick up again when the popup has closed (POPUP_CLOSED_EVENT, sent by useModalDialog).
export const POPUP_CLOSED_EVENT = 'popup-closed';
export const pageBehindPopup = () =>
  typeof document !== 'undefined' && document.documentElement.hasAttribute('data-modal-scene');
