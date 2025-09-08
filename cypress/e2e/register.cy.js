describe('Register Page', () => {
  it('loads register form', () => {
    cy.visit('http://localhost:4000/register'); // frontend register URL

    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button').contains('Sign Up').should('exist');
  });

  it('registers a new user successfully', () => {
    cy.visit('http://localhost:4000/register');


    cy.get('input[name="username"]').type('testuser4');
    cy.get('input[name="email"]').type('testuser4@example.com');
    cy.get('input[name="password"]').type('password123');

    cy.get('button').contains('Sign Up').click();

    cy.url({ timeout: 10000 }).should('include', '/login');


    cy.contains('Login', { timeout: 10000 }).should('exist');
  });
});
