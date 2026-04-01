<script setup>
import { defineProps, computed, watch } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true,
        default: '',
    }
})

const highLightedWord = computed(() => {
    if (props.title.includes(' ')) {
        return props.title.split(' ')[0];
    }
    return props.title;
});

const remainingWords = computed(() => {
    if (props.title.includes(' ')) {
        return props.title.split(' ').slice(1).join(' ');
    }
    return '';
});

watch(() => props.title, (newVal) => {
    console.log(newVal);
    highLightedWord.value = newVal.includes(' ') ? newVal.split(' ')[0] : newVal;
    remainingWords.value = newVal.includes(' ') ? newVal.split(' ').slice(1).join(' ') : '';
});

</script>
<template>
    <div class="pageSectionHeader">
        <div class="greyDividerLineTop"></div>
        <div class="dashboardOptionMessage">
            <span class="colourOrange">{{ highLightedWord }}</span> {{ remainingWords }}
        </div>
        <div class="greyDividerLineBottom"></div>
    </div>
</template>

<style scoped>
.greyDividerLineTop,
.greyDividerLineBottom {
    height: 0px;
    width: 600px;
    border: 1px solid #efefef;
    margin: 10px auto 10px;
}

.colourOrange {
    color: #f26897;
}

.dashboardOptionMessage {
    font-size: 18px;
    text-transform: uppercase;
    color: #768d99;
    text-align: center;
    letter-spacing: 4px;
}
</style>