import { v4 as uuid } from 'uuid';

export class DataUtil {
  static generateId = () => uuid();
}
