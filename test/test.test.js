const psl = require('psl');

// Parse the domain
// let parsed = psl.parse('20231005-2306-dot-dev-jaranda-kr.an.r.appspot.com');
let parsed = psl.parse('jaranda.kr');
// let parsed = psl.parse('itallinform.tistory.com');

console.log(parsed.sld); // Outputs: example
console.log(parsed.subdomain); // Outputs: www
