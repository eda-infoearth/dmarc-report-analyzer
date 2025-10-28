export const sanitizeXml = (xmlString: string) => {
  // 💅シンプルなXXE対策とか、不要なDOCTYPE除去とか
  return xmlString.replace(/<!DOCTYPE[^>]*>/g, "").replace(/<!ENTITY[^>]*>/g, "");
};
  