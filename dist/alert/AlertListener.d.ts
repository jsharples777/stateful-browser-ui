export declare enum AlertType {
    cancelled = 0,
    confirmed = 1
}
export declare type AlertEvent = {
    outcome: AlertType;
    context?: any;
};
export interface AlertListener {
    alertCompleted(event: AlertEvent): void;
}
