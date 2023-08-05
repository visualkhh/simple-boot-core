export interface Transaction<I = any, T = any, C = any, F = any> {
  try(data: I): Promise<T>;
  catch(e: any): Promise<C>;
  finally(): Promise<F>;
}
