window.describe('Player Alternate Path', () => {
  const sessionId = '1223455'; // Replace with a valid session if needed
  const playerName = 'Player1';
  
  window.Cypress.on('uncaught:exception', (err, _) => {
    if (err.message.includes('Session ID is not an active session')) {
      return false;
    }
    return true;
  });

  window.it('shows error when joining invalid session', () => {
    window.cy.visit(`/play/session/${sessionId}`);
    window.cy.get('[data-testid="playerNameInput"]').type(playerName);
    window.cy.get('[data-testid="startGameButton"]').click();
    window.cy.contains('Session ID is not an active session').should('exist');
  });  
});