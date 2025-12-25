import '../style.css';
import '../components/header';

// Register header if not already done
if (!customElements.get('app-header')) {
    const { AppHeader } = await import('../components/header');
    customElements.define('app-header', AppHeader);
}
