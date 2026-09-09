import { provideIcons } from '@ng-icons/core';
import {
  heroArrowRightOnRectangle,
  heroBars3,
  heroCalendarDays,
  heroClipboardDocumentList,
  heroEye,
  heroHome,
  heroPencilSquare,
  heroPlus,
  heroTrash,
  heroTruck,
  heroUsers,
  heroXMark,
} from '@ng-icons/heroicons/outline';

/** App-wide icon registry. Add icons here as features are built. */
export const provideAppIcons = () =>
  provideIcons({
    heroArrowRightOnRectangle,
    heroBars3,
    heroCalendarDays,
    heroClipboardDocumentList,
    heroEye,
    heroHome,
    heroPencilSquare,
    heroPlus,
    heroTrash,
    heroTruck,
    heroUsers,
    heroXMark,
  });
