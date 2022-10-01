export enum AlertType {
    cancelled,
    confirmed
}

export type AlertEvent = {
    outcome: AlertType,
    context?: any
}

export interface AlertListener {
    alertCompleted(event: AlertEvent): void;
}
