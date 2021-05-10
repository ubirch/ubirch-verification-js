import { BehaviorSubject, Observable } from 'rxjs';
import { UbirchMessage } from '../models/models';

export type UbirchObservable = Observable<UbirchMessage>;

export const messageSubject$ = new BehaviorSubject<UbirchMessage>(null);
export const messenger$: UbirchObservable = messageSubject$.asObservable();
