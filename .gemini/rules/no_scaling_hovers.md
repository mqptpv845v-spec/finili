# Rule: No Scaling or Translate Hovers

Never use `scale-*` or `translate-*` CSS classes on hover states for any elements, buttons, or cards in Finali. 
Interactive buttons should morph their `border-radius` (e.g. from `rounded-none` to `rounded-full`) or switch background/opacity on hover, but never scale or shift position in space.
