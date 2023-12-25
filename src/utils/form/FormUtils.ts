//
// export namespace FormEvent {
//   export const preventDefaultFormData = (fc: (f: FormData) => void) => {
//     return (e: React.FormEvent<HTMLFormElement> | React.ChangeEvent<HTMLFormElement>) => {
//       e.preventDefault();
//       fc(new FormData(e.currentTarget));
//     };
//   };
//   export type FormMeta<T extends unknown> = {
//     formData: FormData;
//     form: HTMLFormElement;
//     inputElement: { [key in keyof T]: HTMLInputElement | HTMLInputElement[] };
//   };
//   export const preventDefaultObject = <T extends unknown>(
//     fc: (f: T, meta: FormMeta<T>) => void,
//     config?: {
//       defaultData?: any;
//       forceData?: any;
//       excludes?: string[];
//       fieldConverts?: { name: string; convert: (e: Element, value: FormDataEntryValue) => any }[];
//       convert?: (data: any, meta: FormMeta<T>) => T;
//     }
//   ) => {
//     return (e: React.FormEvent<HTMLFormElement> | React.ChangeEvent<HTMLFormElement>) => {
//       e.preventDefault();
//       const form = e.currentTarget;
//       const formData = new FormData(form);
//       const inputElement: any = {};
//       const obj: any = {};
//       const setting = (value: FormDataEntryValue, key: string, bowl: any, originName: string) => {
//         if (config?.excludes?.includes(originName)) {
//           return;
//         }
//         const allElement = (Array.from(form.querySelectorAll(`[name="${key}"]`)) ?? []) as Element[];
//         const firstElement = allElement[0] as HTMLInputElement;
//         const currentElement = allElement.find(it => (it as any).value === value) ?? firstElement;
//         if (inputElement[key] === undefined && allElement.length > 1) {
//           inputElement[key] = [];
//         }
//         if (Array.isArray(inputElement[key])) {
//           inputElement[key].push(currentElement);
//         } else {
//           inputElement[key] = currentElement;
//         }
//
//         const convert = config?.fieldConverts?.find(it => it.name === key);
//         if (convert) {
//           if (currentElement) {
//             value = convert.convert(currentElement, value);
//           }
//         }
//
//         if (bowl[key] === undefined && allElement.length > 1) {
//           bowl[key] = [];
//         }
//
//         if (Array.isArray(bowl[key])) {
//           bowl[key].push(value);
//         } else {
//           bowl[key] = value;
//         }
//       };
//       formData.forEach((value, key) => {
//         setting(value, key, obj, key);
//       });
//       const formMeta = { formData, form, inputElement };
//       if (config?.convert) {
//         fc(config.convert(obj, formMeta), formMeta);
//       } else {
//         fc({ ...config?.defaultData, ...obj, ...config?.forceData }, formMeta);
//       }
//     };
//   };
// }
