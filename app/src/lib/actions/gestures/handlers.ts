import type { Action } from "svelte/action";
import { setHandlers } from "./shared";
import type { Detail, DragEvent, GestureHandlers, PanEvent } from "./types";
import {
	addListener,
	boundingRect,
	calculateVelocity,
	dispatcher,
	removeListener,
	updateDetail,
} from "./utils";

export function pan(node: HTMLElement) {
	const detail: Detail = {
		startTime: 0,
		timeStamp: 0,
		startY: 0,
		clientY: 0,
		deltaY: 0,
		velocityY: 0,
	};

	const dispatch = dispatcher<PanEvent>();
	const initialRect = { top: 0, height: 0, parentTop: 0 };

	let canFireEvent = false;
	let timer: NodeJS.Timeout;
	const handlers: GestureHandlers = {
		onStart(event) {
			if (!canFireEvent) {
				canFireEvent = true;
				event.stopPropagation();

				const { top, height, parent_top } = boundingRect(node);
				initialRect.top = top;
				initialRect.height = height;
				initialRect.parentTop = parent_top;
				updateDetail(event, detail);

				detail.startY = detail.clientY = event.clientY;

				detail.startTime = detail.timeStamp = event.timeStamp;
				dispatch(node, "panstart", detail);
				timer = setTimeout(() => {
					addListener(window, "pointermove", handlers.onMove);
					addListener(window, "pointerup", handlers.onEnd);
				}, 0);
			}
		},
		onMove(event) {
			if (canFireEvent === false) {
				clearTimeout(timer);
				return;
			}
			event.stopPropagation();
			calculateVelocity(event, detail);

			dispatch(node, "pan", {
				...detail,
				clientY: detail.clientY - initialRect.parentTop - initialRect.height,
			});
		},
		onEnd(event) {
			if (canFireEvent === false) {
				clearTimeout(timer);
				return;
			}
			event.stopPropagation();
			detail.deltaY = detail.clientY - detail.startY;
			calculateVelocity(event, detail);

			dispatch(node, "panend", detail);
			canFireEvent = false;
			removeListener(window, "pointermove", handlers.onMove);
			removeListener(window, "pointerup", handlers.onEnd);
		},
	};
	return setHandlers(node, { handlers, capture: false });
}

export const draggable: Action<
	HTMLElement,
	never,
	{
		"on:bb-dragstart": (event: CustomEvent<Detail>) => void;
		"on:bb-dragmove": (event: CustomEvent<Detail>) => void;
		"on:bb-dragend": (event: CustomEvent<Detail>) => void;
	}
> = (node: HTMLElement) => {
	const detail: Detail = {
		startTime: 0,
		timeStamp: 0,
		startY: 0,
		clientY: 0,
		deltaY: 0,
		velocityY: 0,
	};
	const dispatch = dispatcher<DragEvent>();
	const initialRect = { top: 0, height: 0, parentTop: 0 };

	const handlers: GestureHandlers = {
		onStart(event) {
			event.stopPropagation();

			const { top, height, parent_top } = boundingRect(node);
			detail.startY = detail.clientY = event.clientY;
			initialRect.top = top;
			initialRect.height = height;
			initialRect.parentTop = parent_top;
			updateDetail(event, detail);

			dispatch(node, "bb-dragstart", detail);

			addListener(window, "pointermove", handlers.onMove);
			addListener(window, "pointerup", handlers.onEnd, { passive: true });
			addListener(window, "pointercancel", handlers.onEnd);
		},
		onMove(event) {
			event.stopImmediatePropagation();
			// event.preventDefault();
			calculateVelocity(event, detail);

			dispatch(node, "bb-dragmove", {
				...detail,
				clientY: detail.clientY - initialRect.parentTop - initialRect.height,
			});
			// event.preventDefault();
		},
		onEnd(event) {
			event.stopImmediatePropagation();
			// event.preventDefault();
			detail.deltaY = detail.clientY - detail.startY;

			calculateVelocity(event, detail);

			dispatch(node, "bb-dragend", detail);
			// detail.clientY = 0;
			removeListener(window, "pointermove", handlers.onMove);
			removeListener(window, "pointercancel", handlers.onEnd);
			removeListener(window, "pointerup", handlers.onEnd);
			// event.preventDefault();
		},
	};
	return setHandlers(node, { handlers, capture: true });
};
