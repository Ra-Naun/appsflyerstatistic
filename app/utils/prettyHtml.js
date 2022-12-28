import jsonPrettyHtml from 'json-pretty-html';

const dimensions = {
  length: 7.0,
  width: 12.0,
  height: 9.5,
};

export const prettyHtml = jsonData => {
  return jsonPrettyHtml.default(jsonData, dimensions);
};
