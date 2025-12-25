import{s}from"./supabase-w99FfbcE.js";class d{static async getAllOrders(){const{data:t,error:r}=await s.from("orders").select(`
                *,
                items:order_items (
                    quantity,
                    unit_price,
                    products (
                        name,
                        images
                    )
                )
            `).order("created_at",{ascending:!1});if(r)throw console.error("Error fetching orders:",r),r;return t}static async updateOrderStatus(t,r){const{data:e,error:a}=await s.from("orders").update({status:r}).eq("id",t).select().single();if(a)throw console.error("Error updating order status:",a),a;return e}static async getOrderByTracking(t){const{data:r,error:e}=await s.from("orders").select(`
                *,
                items:order_items (
                    quantity,
                    unit_price,
                    products (
                        name,
                        images
                    )
                )
            `).eq("tracking_number",t).single();return e?(console.error("Error fetching order by tracking:",e),null):r}static generateTrackingNumber(){const t=Date.now().toString(36).toUpperCase().slice(-4),r=Math.random().toString(36).toUpperCase().slice(2,6);return`7S-${t}-${r}`}static async getOrderStats(){const{data:t,error:r}=await s.from("orders").select("total_amount, status, created_at");if(r)throw r;const e=t.reduce((o,n)=>o+(Number(n.total_amount)||0),0),a=t.length;return{totalRevenue:e,totalOrders:a,avgOrderValue:a>0?e/a:0,pendingOrders:t.filter(o=>o.status==="pending").length}}}export{d as O};
