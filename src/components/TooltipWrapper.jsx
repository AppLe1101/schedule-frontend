// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import * as Tooltip from "@radix-ui/react-tooltip";

const TooltipWrapper = ({ children, label }) => (
  <Tooltip.Provider delayDuration={700}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {typeof children === "string" ? <span>{children}</span> : children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={10}
          className="tooltip-content"
        >
          {label}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default TooltipWrapper;
