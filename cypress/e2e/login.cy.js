describe('Login Page', () => {
  it('loads login form', () => {
    cy.visit('http://localhost:4000');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button').contains('Login').should('exist');
  });

  it('logs in successfully with valid credentials', () => {
    cy.visit('http://localhost:4000');
    cy.get('input[name="email"]').type('cat1@gmail.com');
    cy.get('input[name="password"]').type('123');
    cy.get('button').contains('Login').click();


    cy.url({ timeout: 10000 }).should('include', '/products');

    
    cy.contains('Name', { timeout: 10000 }).should('exist');
  });
});
