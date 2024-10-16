const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

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

    // Parse the HTML document using JSDOM
    const dom = new JSDOM(data);
    const document = dom.window.document;

    // Convert relative URLs for resources like JS files, CSS, and images to absolute URLs
    const baseUrl = new URL(url);
    const convertRelativeToAbsolute = (attribute, tag) => {
      const elements = document.querySelectorAll(`${tag}[${attribute}]`);
      elements.forEach(element => {
        const attributeValue = element.getAttribute(attribute);
        if (attributeValue && attributeValue.startsWith('/')) {
          element.setAttribute(attribute, `${baseUrl.origin}${attributeValue}`);
        }
      });
    };

    // Convert relative URLs for href, src, and other attributes
    convertRelativeToAbsolute('href', 'link');
    convertRelativeToAbsolute('src', 'script');
    convertRelativeToAbsolute('src', 'img');

    // Serialize the updated HTML back to a string
    data = dom.serialize();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'text/html', // Set the correct content type for HTML
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
