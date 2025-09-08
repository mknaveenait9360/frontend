/// <reference types="cypress" />

describe('Products Page Tests', () => {
  const email = 'cat1@gmail.com';
  const password = '123';

  beforeEach(() => {
    // Visit login page and login
    cy.visit('http://localhost:4000/login');

    cy.get('input[name="email"]', { timeout: 10000 }).clear().type(email, { force: true });
    cy.get('input[name="password"]').clear().type(password, { force: true });

    cy.get('button').contains('Login').click();

    // Wait for redirect to products page
    cy.url({ timeout: 10000 }).should('include', '/products');

    // Wait for product page to fully load
    cy.get('h5', { timeout: 10000 }).should('contain.text', 'Product Management');
    cy.wait(1000); // give time for DataGrid to render
  });

  it('loads product page correctly', () => {
    cy.get('[data-testid="product-name"]', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="product-price"]').should('exist');
    cy.get('[data-testid="product-stock"]').should('exist');
    cy.get('[data-testid="create-product"]').should('exist');

    cy.get('.MuiDataGrid-root .MuiDataGrid-row', { timeout: 15000 }).should('exist');
  });

  it('creates a new product "ball"', () => {
    const name = 'ball';
    const price = '99';
    const stock = '10';

    cy.get('[data-testid="product-name"]').clear().type(name);
    cy.get('[data-testid="product-price"]').clear().type(price);
    cy.get('[data-testid="product-stock"]').clear().type(stock);
    cy.get('[data-testid="create-product"]').click();

    // Wait for DataGrid to refresh
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('contain.text', name);
  });

  it('edits the first product', () => {
    cy.get('.MuiDataGrid-root .MuiDataGrid-row', { timeout: 15000 }).first().within(() => {
      cy.get('button[aria-label="Edit"]').click();
    });

    const newName = 'edited-ball';
    cy.get('[data-testid="product-name"]').clear().type(newName);
    cy.get('[data-testid="create-product"]').click();

    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('contain.text', newName);
  });

  it('deletes the first product', () => {
    cy.get('.MuiDataGrid-root .MuiDataGrid-row', { timeout: 15000 }).first().within(() => {
      cy.get('button[aria-label="Delete"]').click();
    });

    // Optionally, confirm deletion if modal appears
    // cy.get('button').contains('Confirm').click();

    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('not.contain.text', 'edited-ball');
  });
});
