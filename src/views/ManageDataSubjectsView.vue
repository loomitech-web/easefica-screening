<script setup>
import { reactive } from 'vue';
import BaseInput from '../components/fields/BaseInput.vue';
import BaseSelect from '../components/fields/BaseSelect.vue';
import FileUpload from '../components/fields/FileUpload.vue';

const subjectTypes = [
  { title: 'Individual', value: 'individual' },
  { title: 'Company', value: 'company' },
  { title: 'Trust', value: 'trust' },
];

const form = reactive({
  subjectName: '',
  referenceId: '',
  subjectType: null,
  attachments: [],
});

function submit() {
  // Placeholder submit action while backend endpoint wiring is phased in.
  console.info('Data subject payload', form);
}
</script>

<template>
  <v-container fluid class="screen-page">
    <v-row>
      <v-col cols="12" md="8">
        <h1 class="text-h5 mb-4 screen-page__title">Manage Data Subjects</h1>
        <v-card class="pa-6 screen-panel">
          <v-card-title class="px-0 screen-panel__title">Manage Data Subjects</v-card-title>
          <v-card-text class="px-0">
            <v-row>
              <v-col cols="12" md="6">
                <BaseInput v-model="form.subjectName" label="Subject Name" hint="Legal name of subject" />
              </v-col>
              <v-col cols="12" md="6">
                <BaseInput v-model="form.referenceId" label="Reference ID" hint="Internal traceability code" />
              </v-col>
              <v-col cols="12" md="6">
                <BaseSelect
                  v-model="form.subjectType"
                  :items="subjectTypes"
                  label="Subject Type"
                  hint="Select the entity category"
                />
              </v-col>
              <v-col cols="12">
                <FileUpload
                  v-model="form.attachments"
                  label="Supporting Document"
                  hint="Upload optional KYC support files"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-0">
            <v-btn color="primary" @click="submit">Save Subject</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
