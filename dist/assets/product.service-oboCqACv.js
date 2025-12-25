import{s as o}from"./supabase-w99FfbcE.js";class g{static async getProducts(){const{data:t,error:r}=await o.from("products").select(`
                *,
                categories (
                    name
                )
            `).eq("status","active").order("created_at",{ascending:!1});if(r)throw r;return t}static async getProductsByCategory(t){const{data:r,error:e}=await o.from("categories").select("id").ilike("name",t).single();if(e)return console.warn("Category not found:",t),[];const{data:a,error:c}=await o.from("products").select(`
                *,
                categories (
                    name
                )
            `).eq("category_id",r.id).eq("status","active").order("created_at",{ascending:!1});if(c)throw c;return a}static async getProductById(t){const{data:r,error:e}=await o.from("products").select(`
                *,
                categories (
                    name
                )
            `).eq("id",t).single();if(e)throw e;return r}static async createProduct(t){const r={...t,status:t.status||"active",inventory_count:t.inventory_count||0,images:t.images||[]},{data:e,error:a}=await o.from("products").insert([r]).select().single();if(a)throw a;return e}static async updateProduct(t,r){const{data:e,error:a}=await o.from("products").update(r).eq("id",t).select().single();if(a)throw a;return e}static async deleteProduct(t){const{error:r}=await o.from("products").delete().eq("id",t);if(r)throw r;return!0}static async getTrendingProducts(){const{data:t,error:r}=await o.from("order_items").select("product_id, quantity");if(r)throw r;const e={};t?.forEach(s=>{e[s.product_id]=(e[s.product_id]||0)+s.quantity});const a=Object.keys(e).sort((s,i)=>e[i]-e[s]).slice(0,4);if(a.length===0)return this.getProducts().then(s=>s.slice(0,4));const{data:c,error:n}=await o.from("products").select(`
                *,
                categories (
                    name
                )
            `).in("id",a).eq("status","active");if(n)throw n;const d=c;return a.map(s=>d.find(i=>i.id===s)).filter(s=>!!s)}}export{g as P};
