

exports.handler = async function(event, context) {
  const url = event.queryStringParameters.url;
  if (!url) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'URL parameter is required',
    };
  }
  try {
    const response = await fetch(url);
    let data = await response.text();

    // Convert relative URLs to absolute URLs
    const baseUrl = new URL(url);
    data = data.replace(/(href|src)="(\/[^"]*)"/g, `$1="${baseUrl.origin}$2"`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: `Error fetching content: ${error.message}`,
    };
  }
};
