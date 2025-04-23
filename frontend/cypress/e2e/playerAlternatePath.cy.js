describe('Player Alternate Path', () => {
  const sessionId = '1223455'; // Replace with a valid session if needed
  const playerName = 'Player1';
  
  Cypress.on('uncaught:exception', (err, runnable) => {
    if (err.message.includes('Session ID is not an active session')) {
      return false;
    }
    return true;
  });

  it('shows error when joining invalid session', () => {
    cy.visit(`/play/session/${sessionId}`);
    cy.get('[data-testid="playerNameInput"]').type(playerName);
    cy.get('[data-testid="startGameButton"]').click();
    cy.contains('Session ID is not an active session').should('exist');
  });  
});