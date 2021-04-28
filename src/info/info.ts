import { BehaviorSubject, Observable } from 'rxjs';
import { IUbirchError, IUbirchInfo } from '../models/models';

export const infoSubject = new BehaviorSubject<IUbirchError | IUbirchInfo>(null);
export const infoWatcher$: Observable<IUbirchError | IUbirchInfo> = infoSubject.asObservable();
