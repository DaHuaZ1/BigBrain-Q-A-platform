// frontend/cypress/e2e/adminHappyPath.cy.js

window.describe('Admin Full Happy Path (Single Flow)', () => {
  const email = `admin${Date.now()}@test.com`;
  const password = 'Password123';
  const gameName = 'Happy Test Game';
  
  window.it('completes the full admin flow from registration to login again', () => {
    // Visit signup and fill form
    window.cy.visit('/signup');
    window.cy.wait(500);
    window.cy.get('#email-register-input').type(email);
    window.cy.get('#username-register-input').type('Admin');
    window.cy.get('#password-register-input').type(password);
    window.cy.get('#confirm-password-register-input').type(password);
    window.cy.get('input').last().type('AAAA');
  
    // Intercept token and save it
    window.cy.intercept('POST', '**/admin/auth/register').as('register');
    window.cy.get('button').contains(/submit/i).click();
    window.cy.wait('@register').then((interception) => {
      const token = interception.response.body.token;
      window.cy.window().then((win) => {
        win.localStorage.setItem('token', token);
      });
    });
  
    // Revisit dashboard so React picks up token
    window.cy.visit('/dashboard');
    window.cy.url().should('include', '/dashboard');
    window.cy.wait(500);
  
    // Create a new game
    window.cy.get('[data-testid="add-game-card"]').click();
    window.cy.get('label').contains('Game Name')
      .parent()
      .find('input')
      .should('be.visible')
      .type(gameName);
    window.cy.get('button').contains(/create/i).click();
    window.cy.contains(gameName, { timeout: 5000 }).should('exist');

    // Start and end game
    window.cy.get('[data-testid="start-game-btn"]').click();
    window.cy.wait(500);
    window.cy.get('body').type('{esc}');
    window.cy.wait(1500);
    window.cy.get('[data-testid="end-game-btn"]', { timeout: 5000 }).click({ force: true });
    // Confirm stop session
    window.cy.get('.MuiDialog-root').within(() => {
      window.cy.get('[data-testid="stop-confirm').click();
    });

  
    // View results
    window.cy.get('[data-testid="show-result"]').click();
    window.cy.wait(500);
    window.cy.get('[data-testid="sure-for-result"]').click();
    window.cy.wait(500);
    window.cy.contains(/top 5 users/i).should('exist');
    window.cy.get('[data-testid="close-result"]').click();
  
    // Log out
    window.cy.contains(/logout/i).click();
    window.cy.wait(500);
    window.cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });
  
    // Log in again
    window.cy.visit('/login');
    window.cy.get('#email-login-input').type(email);
    window.cy.get('#password-login-input').type(password);
    window.cy.get('input').last().type('AAAA');
    window.cy.get('button').contains(/login submit/i).click();
    window.cy.url().should('include', '/dashboard');
  });
});
  