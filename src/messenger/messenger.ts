import { BehaviorSubject, Observable } from 'rxjs';
import { UbirchMessage } from '../models/models';

export const messageSubject$ = new BehaviorSubject<UbirchMessage>(null);
export const messenger$: Observable<UbirchMessage> = messageSubject$.asObservable();
