import { readBlockConfig } from '../../scripts/aem.js';
import { CS_FETCH_GRAPHQL, getProductLink } from '../../scripts/commerce.js';

async function fetchCategoryProducts(categoryId, maxProducts) {
  const query = `
    query GetCategoryProducts($categoryId: String!, $pageSize: Int!) {
      productSearch(
        phrase: ""
        filter: [{ attribute: "categoryIds", eq: $categoryId }]
        page_size: $pageSize
      ) {
        items {
          productView {
            name
            sku
            urlKey
            images(roles: ["image"]) {
              url
              label
            }
            ... on SimpleProductView {
              price {
                final { amount { value currency } }
              }
            }
            ... on ComplexProductView {
              priceRange {
                minimum {
                  final { amount { value currency } }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { data } = await CS_FETCH_GRAPHQL.fetchGraphQl(query, {
    variables: { categoryId, pageSize: maxProducts },
  });

  return data?.productSearch?.items || [];
}

function getFinalPrice(product) {
  return (
    product.price?.final?.amount
    ?? product.priceRange?.minimum?.final?.amount
  );
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default async function decorate(block) {
  const {
    'category-id': categoryId = '',
    heading = 'Featured Products',
    'max-products': maxProductsStr = '4',
  } = readBlockConfig(block);

  const maxProducts = parseInt(maxProductsStr, 10) || 4;
  // Default root category from config.json plugins.picker.rootCategory for local demos
  const effectiveCategoryId = categoryId || '2';

  block.innerHTML = `
    <div class="promo-banner__heading"><h2>${escapeHtml(heading)}</h2></div>
    <div class="promo-banner__products"><p>Loading products...</p></div>
  `;

  const productsContainer = block.querySelector('.promo-banner__products');

  try {
    const products = await fetchCategoryProducts(effectiveCategoryId, maxProducts);

    if (products.length === 0) {
      productsContainer.innerHTML = '<p>No products found.</p>';
      return;
    }

    productsContainer.innerHTML = products.map((item) => {
      const product = item.productView;
      const image = product.images?.[0];
      const price = getFinalPrice(product);
      const productUrl = getProductLink(product.urlKey, product.sku);
      const name = escapeHtml(product.name);
      const alt = escapeHtml(image?.label || product.name);
      return `
        <a class="promo-banner__product" href="${productUrl}">
          ${image ? `<img src="${image.url}" alt="${alt}" loading="lazy" width="300" height="300" />` : ''}
          <span class="promo-banner__product-name">${name}</span>
          ${price ? `<span class="promo-banner__product-price">${price.currency} ${price.value.toFixed(2)}</span>` : ''}
        </a>
      `;
    }).join('');
  } catch (error) {
    console.error('Promo banner: failed to fetch products', error);
    productsContainer.innerHTML = '<p>Unable to load products.</p>';
  }
}
