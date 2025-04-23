// frontend/cypress/e2e/adminHappyPath.cy.js

describe('Admin Full Happy Path (Single Flow)', () => {
  const email = `admin${Date.now()}@test.com`;
  const password = 'Password123';
  const gameName = 'Happy Test Game';
  
  it('completes the full admin flow from registration to login again', () => {
    // Visit signup and fill form
    cy.visit('/signup');
    cy.wait(500);
    cy.get('#email-register-input').type(email);
    cy.get('#username-register-input').type('Admin');
    cy.get('#password-register-input').type(password);
    cy.get('#confirm-password-register-input').type(password);
    cy.get('input').last().type('AAAA');
  
    // Intercept token and save it
    cy.intercept('POST', '**/admin/auth/register').as('register');
    cy.get('button').contains(/submit/i).click();
    cy.wait('@register').then((interception) => {
      const token = interception.response.body.token;
      cy.window().then((win) => {
        win.localStorage.setItem('token', token);
      });
    });
  
    // Revisit dashboard so React picks up token
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.wait(500);
  
    // Create a new game
    cy.get('[data-testid="add-game-card"]').click();
    cy.get('label').contains('Game Name')
      .parent()
      .find('input')
      .should('be.visible')
      .type(gameName);
    cy.get('button').contains(/create/i).click();
    cy.contains(gameName, { timeout: 5000 }).should('exist');

    // Start and end game
    cy.get('[data-testid="start-game-btn"]').click();
    cy.wait(500);
    cy.get('body').type('{esc}');
    cy.wait(1500);
    cy.get('[data-testid="end-game-btn"]', { timeout: 5000 }).click({ force: true });
    // Confirm stop session
    cy.get('.MuiDialog-root').within(() => {
      cy.get('[data-testid="stop-confirm').click();
    });

  
    // View results
    cy.get('[data-testid="show-result"]').click();
    cy.wait(500);
    cy.get('[data-testid="sure-for-result"]').click();
    cy.wait(500);
    cy.contains(/top 5 users/i).should('exist');
    cy.get('[data-testid="close-result"]').click();
  
    // Log out
    cy.contains(/logout/i).click();
    cy.wait(500);
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });
  
    // Log in again
    cy.visit('/login');
    cy.get('#email-login-input').type(email);
    cy.get('#password-login-input').type(password);
    cy.get('input').last().type('AAAA');
    cy.get('button').contains(/login submit/i).click();
    cy.url().should('include', '/dashboard');
  });
});
  