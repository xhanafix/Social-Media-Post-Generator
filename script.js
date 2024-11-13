async function generatePosts() {
    const apiKey = document.getElementById('apiKey').value;
    const product = document.getElementById('product').value;
    const language = document.getElementById('language').value;
    const tone = document.getElementById('tone').value;
    const contentBucket = document.getElementById('contentBucket').value;

    if (!apiKey || !product) {
        alert('Please fill in all required fields');
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: language === 'malay' 
                        ? "Anda adalah pakar penulisan kandungan media sosial yang fokus kepada penghasilan kandungan yang berkaitan dengan produk. Tulis dalam Bahasa Malaysia dengan konteks tempatan. PENTING: Pastikan setiap post berkait rapat dengan produk dan tema yang dipilih."
                        : "You are a social media content expert focused on creating product-centric content. Each post must directly relate to the product while matching the chosen content theme. IMPORTANT: Ensure strong connection between product features and content bucket theme."
                }, {
                    role: "user",
                    content: `Create three product-focused social media posts (Facebook, Twitter, and TikTok) using a ${tone} tone and ${contentBucket} content bucket approach for this product: ${product}. 

                    ${getDetailedProductBucketInstructions(contentBucket, language, product)}

                    IMPORTANT: Format the response EXACTLY as shown below, ensuring it's valid JSON:
                    {
                        "facebook": "HOOK LINE\\nSECOND LINE\\n\\nContent here",
                        "twitter": "HOOK LINE\\n\\nContent here",
                        "tiktok": "HOOK LINE\\n\\nContent here"
                    }

                    Key requirements:
                    1. Each post must directly mention or relate to the product
                    2. Content must match both the product context and ${contentBucket} theme
                    3. Include specific product features or benefits
                    4. Use relevant hashtags for both product and theme
                    5. Maintain the chosen ${tone} tone throughout`
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        let posts;
        try {
            // Try to parse the response content
            const content = data.choices[0].message.content.trim();
            posts = JSON.parse(content);

            // Validate the expected structure
            if (!posts.facebook || !posts.twitter || !posts.tiktok) {
                throw new Error('Invalid response structure');
            }
        } catch (parseError) {
            console.error('Parsing Error:', parseError);
            console.log('Raw Content:', data.choices[0].message.content);
            
            // Attempt to clean and fix common JSON issues
            let cleanContent = data.choices[0].message.content
                .replace(/[\n\r]+/g, '\\n') // Fix newlines
                .replace(/"/g, '\\"')       // Escape quotes
                .replace(/\\\\/g, '\\')     // Fix double escapes
                .trim();
            
            try {
                // Try parsing the cleaned content
                posts = JSON.parse(`{${cleanContent}}`);
            } catch (secondError) {
                throw new Error('Failed to parse the generated content. Please try again.');
            }
        }

        // Update the textareas with the content
        document.getElementById('facebookOutput').value = posts.facebook;
        document.getElementById('twitterOutput').value = posts.twitter;
        document.getElementById('tiktokOutput').value = posts.tiktok;

    } catch (error) {
        console.error('Error details:', error);
        alert('Error generating posts: ' + error.message + '\nPlease try again.');
    } finally {
        setLoadingState(false);
    }
}

function getDetailedProductBucketInstructions(bucket, language, product) {
    const instructions = {
        education: {
            english: `
                Create educational content that:
                - Teaches specific ways to use the product
                - Explains unique product features in detail
                - Shares expert tips about product usage
                - Addresses common questions about the product
                - Uses educational terms while featuring product benefits
                - Example approach: "Did you know our [product] can [unique benefit]? Here's how..."`,
            malay: `
                Buat kandungan pendidikan yang:
                - Ajar cara-cara khusus menggunakan produk
                - Terangkan ciri-ciri unik produk secara terperinci
                - Kongsi tips pakar tentang penggunaan produk
                - Jawab soalan lazim tentang produk
                - Guna terma pendidikan sambil tonjolkan manfaat produk
                - Contoh pendekatan: "Tahukah anda [produk] kami boleh [manfaat unik]? Begini caranya..."`
        },
        inspiration: {
            english: `
                Create inspirational content that:
                - Shares real success stories using the product
                - Shows transformational results from product use
                - Connects product benefits to aspirational goals
                - Uses motivational language tied to product features
                - Highlights life-changing product impacts
                - Example approach: "See how [product] transformed [user]'s life..."`,
            malay: `
                Buat kandungan inspirasi yang:
                - Kongsi kisah kejayaan sebenar menggunakan produk
                - Tunjukkan hasil transformasi dari penggunaan produk
                - Hubungkan manfaat produk dengan matlamat aspirasi
                - Guna bahasa motivasi yang berkait dengan ciri produk
                - Tonjolkan impak produk yang mengubah hidup
                - Contoh pendekatan: "Lihat bagaimana [produk] mengubah hidup [pengguna]..."`
        },
        personal: {
            english: `
                Create behind-the-scenes content that:
                - Shows product development process
                - Shares team stories related to the product
                - Reveals interesting product creation facts
                - Connects product features to company values
                - Humanizes the product through personal stories
                - Example approach: "The story behind our [product]'s [feature]..."`,
            malay: `
                Buat kandungan peribadi yang:
                - Tunjukkan proses pembangunan produk
                - Kongsi cerita team berkaitan produk
                - Dedahkan fakta menarik penciptaan produk
                - Hubungkan ciri produk dengan nilai syarikat
                - Personalisasikan produk melalui cerita peribadi
                - Contoh pendekatan: "Kisah disebalik [ciri] [produk] kami..."`
        },
        promotion: {
            english: `
                Create promotional content that:
                - Highlights specific product features and benefits
                - Showcases unique selling points
                - Presents special offers or deals
                - Uses persuasive language about product value
                - Includes clear call-to-action for the product
                - Example approach: "Discover why [product] is the perfect solution for [problem]..."`,
            malay: `
                Buat kandungan promosi yang:
                - Tonjolkan ciri dan manfaat khusus produk
                - Paparkan kelebihan jualan unik
                - Persembahkan tawaran atau promosi istimewa
                - Guna bahasa pemujukan tentang nilai produk
                - Masukkan seruan tindakan yang jelas untuk produk
                - Contoh pendekatan: "Ketahui mengapa [produk] adalah penyelesaian sempurna untuk [masalah]..."`
        },
        conversational: {
            english: `
                Create engaging content that:
                - Asks questions about product usage
                - Encourages sharing product experiences
                - Creates discussions about product benefits
                - Polls audience about product features
                - Invites product-related feedback
                - Example approach: "How do you use [product] to [benefit]? Share your story!"`,
            malay: `
                Buat kandungan interaktif yang:
                - Tanya soalan tentang penggunaan produk
                - Galakkan perkongsian pengalaman produk
                - Cipta perbincangan tentang manfaat produk
                - Buat undian tentang ciri-ciri produk
                - Jemput maklum balas berkaitan produk
                - Contoh pendekatan: "Bagaimana anda guna [produk] untuk [manfaat]? Kongsi pengalaman anda!"`
        },
        entertainment: {
            english: `
                Create fun content that:
                - Uses humor related to product use
                - Creates entertaining scenarios featuring the product
                - Shares fun facts about the product
                - Links current trends to product features
                - Makes product-related memes
                - Example approach: "When your [product] does [unexpected benefit] 😂..."`,
            malay: `
                Buat kandungan hiburan yang:
                - Guna humor berkaitan penggunaan produk
                - Cipta senario menghiburkan yang menonjolkan produk
                - Kongsi fakta menarik tentang produk
                - Hubungkan trend semasa dengan ciri produk
                - Buat meme berkaitan produk
                - Contoh pendekatan: "Bila [produk] anda buat [manfaat tak dijangka] 😂..."`
        }
    };

    return instructions[bucket][language === 'malay' ? 'malay' : 'english'];
}

function setLoadingState(isLoading) {
    const button = document.querySelector('.input-section button');
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Generating...' : 'Generate Posts';
}

function copyText(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = textarea.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
} 