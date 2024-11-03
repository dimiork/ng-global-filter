export class ArrayUtil {
  static hasDuplicates = (list: string[] = []) => new Set(list).size < list.length;
}
