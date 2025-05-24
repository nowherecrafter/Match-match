export function load404(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const content = `
    <div class="content-wrapper">
      <div class="main-container text-center">
        <h1 class="mb-4">404 - Page Not Found</h1>
        <p class="lead">The page you're looking for doesn't exist or has been moved.</p>
      </div>
    </div>
  `;

  app.innerHTML = content;
}
