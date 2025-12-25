export class NewsletterService {
    private static API_URL = '/api/subscribe';

    static async subscribe(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.error || 'Subscription failed. Please try again.'
                };
            }

            return {
                success: true,
                message: 'Thank you! Check your inbox for your code.'
            };
        } catch (error) {
            console.error('Newsletter Service Error:', error);
            return {
                success: false,
                message: 'Connection error. Please check your internet.'
            };
        }
    }

    static validateEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}
