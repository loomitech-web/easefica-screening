### **Project Context: easefica-screening**
**Objective:** Build a screening-only facility UI using Vue 3 and Vite, following the UI/UX patterns of `easefica-admin-template/` (Vue 2) but modernized with Pinia and Composition API.

**Tech Stack:**
* **Frontend:** Vue 3, Vite, Pinia, Tailwind/CSS (consistent with template).
* **Backend:** OData 4.2 (Node.js) using a Plugin-based architecture.
* **Auth:** Auth0 (Existing implementation).

**Architectural Guidelines:**
1.  **Component Structure:** * Atomic input fields (Inputs, Labels, Dropdowns, Uploads) must reside in `src/components/fields/`.
    * Complex components (e.g., editors, charts) reside in `src/components/`.
2.  **State Management:** Use **Pinia** stores for all data fetching and global state (Auth, Screenings, Reports).
3.  **Pattern Matching:** Reference `easefica-admin-template/` for layout, sidebar behavior, and styling, but **convert all logic from Options API to Composition API (`<script setup>`)**.
4.  **Backend Logic:** Business logic belongs in backend **plugins**. Models must access this via `req.plugins.pluginName`.

### **Phase 1: Layout & Navigation (The Shell)**
* Implement the Side Nav mimicking the `easefica-admin-template` behavior (collapsible, active states).
* **Menu Items:** Dashboard, Manage Data Subjects, Screening Results, Reports (Sub-menu: Match Reports, Screening Reports, Cost Report).
* Create a `MainLayout.vue` that wraps the `router-view`.

### **Phase 2: Component Library (`components/fields`)**
* Create reusable, form-compatible wrappers for:
    * `BaseInput.vue`, `BaseSelect.vue`, `FileUpload.vue`.
* Ensure these components support `v-model` (Vue 3 style) and emit consistent events.

### **Phase 3: Dashboard & Screening Views**
* **Dashboard:** Implement a summary view showing recent screenings. Add visual indicators (badges/colors) for "Matches Found" vs "Clear".
* **Screening History:** A searchable table view fetching data from the OData backend.
* **Match Report:** A detailed view showing specific matches against screened lists.

### **Phase 4: Backend Integration (OData 4.2)**
* Locate routes in `odata4.2/routes/custom/easefica-screening/`.
* Modify/Add endpoints to support the Dashboard (aggregates) and Reporting (filters).
* Ensure all business logic for screening results is abstracted into a backend plugin.

### **Existing data** 
* Screening matches, results and all structures are defined in @odata/routes/custom/easefica-screening and in @screening-processor

---
