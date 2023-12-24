// Created
export const CREATED = 'CREATED';

// Geocoding
export const GEOCODE_FAILED = 'GEOCODE_FAILED';
export const GEOCODE_FAILED_PICKUP = 'GEOCODE_FAILED_PICKUP';
export const GEOCODE_FAILED_DROPOFF = 'GEOCODE_FAILED_DROPOFF';
export const GEOCODED = 'GEOCODED';

// Assigned
export const ASSIGNED = 'ASSIGNED';

// Pickup
export const PICKUP_EN_ROUTE = 'PICKUP_EN_ROUTE';
export const PICKUP_DELAY = 'PICKUP_DELAY';
export const CANCELLED_BEFORE_PICKUP = 'CANCELLED_BEFORE_PICKUP';
export const PICKUP_READY = 'PICKUP_READY';
export const PICKUP_FAILED = 'PICKUP_FAILED';
export const PICKUP_SUCCEEDED = 'PICKUP_SUCCEEDED';

// Dropoff
export const DROPOFF_EN_ROUTE = 'DROPOFF_EN_ROUTE';
export const DROPOFF_DELAY = 'DROPOFF_DELAY';
export const CANCELLED_AFTER_PICKUP = 'CANCELLED_AFTER_PICKUP';
export const DROPOFF_READY = 'DROPOFF_READY';
export const DROPOFF_FAILED = 'DROPOFF_FAILED';
export const DROPOFF_SUCCEEDED = 'DROPOFF_SUCCEEDED';
export const DROPOFF_REATTEMPTING = 'DROPOFF_REATTEMPTING';
export const UNDELIVERABLE = 'UNDELIVERABLE';
export const DISPOSABLE = 'DISPOSABLE';

// Return
export const RETURN_EN_ROUTE = 'RETURN_EN_ROUTE';
export const RETURN_DELAY = 'RETURN_DELAY';
export const RETURN_READY = 'RETURN_READY';
export const RETURN_FAILED = 'RETURN_FAILED';
export const RETURN_SUCCEEDED = 'RETURN_SUCCEEDED';

// INBOUND:
export const RECEIVED_OK = 'RECEIVED_OK';
export const RECEIVED_DAMAGED = 'RECEIVED_DAMAGED';
export const MISSING = 'MISSING';


// CONVERTED COMPOUND SIGNALS
export const PICKUP_FAILED__MISSING = 'PICKUP_FAILED__MISSING';
export const PICKUP_FAILED__RECEIVED_OK = 'PICKUP_FAILED__RECEIVED_OK';
export const PICKUP_FAILED__RECEIVED_DAMAGED = 'PICKUP_FAILED__RECEIVED_DAMAGED';
export const PICKUP_FAILED__UNSCANNED = 'PICKUP_FAILED__UNSCANNED';
export const PICKUP_SUCCEEDED__REATTEMPT = 'PICKUP_SUCCEEDED__REATTEMPT';
export const DROPOFF_FAILED__REATTEMPT = 'DROPOFF_FAILED__REATTEMPT';
export const DROPOFF_SUCCEEDED__REATTEMPT = 'DROPOFF_SUCCEEDED__REATTEMPT';

// MILESTONES
export const PROCESSING = 'Processing';
export const PROCESSED = 'Processed';
export const RECEIVED = 'Received at facility';
export const RECEIVED_ALT = 'Received';
export const FAILED = 'Failed';
export const RETURNED = 'Returned';
export const CANCELLED = 'Cancelled';
export const OUT_FOR_DELIVERY = 'Out for Delivery';
export const REATTEMPTING = 'Re-attempting';
export const NEXT_IN_QUEUE = 'Next in Queue';
export const UNDELIVERABLE_SH = 'Undeliverable';
export const DELIVERED = 'Delivered';


// COMMUNICATION
export const INFORM_RECIPIENT_PICKUP_SUCCEEDED = 'INFORM_RECIPIENT_PICKUP_SUCCEEDED';
export const INFORM_RECIPIENT_PICKUP_FAILED = 'INFORM_RECIPIENT_PICKUP_FAILED';
export const INFORM_RECIPIENT_COMING_SOON = 'INFORM_RECIPIENT_COMING_SOON';
export const INFORM_RECIPIENT_NEXT_IN_LINE = 'INFORM_RECIPIENT_NEXT_IN_LINE';
export const INFORM_RECIPIENT_DROPOFF_SUCCEEDED = 'INFORM_RECIPIENT_DROPOFF_SUCCEEDED';
export const INFORM_RECIPIENT_DROPOFF_FAILED = 'INFORM_RECIPIENT_DROPOFF_FAILED';


// Outbound QA
export const NOT_FOUND = 'NOT_FOUND';
export const LEAKING = 'LEAKING';
export const DAMAGED = 'DAMAGED';


export const REQUESTED = 'Requested';