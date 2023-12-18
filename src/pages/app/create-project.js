import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";
import Quill from "quill";
import { Datepicker } from "vanillajs-datepicker";

const quillOptions = { theme: "snow" };

const editorDescription = new Quill("#editorBrandServiceOrProduct", quillOptions);
const editorDescription = new Quill("#editorBrandIdentityOrMessage", quillOptions);
const editorDescription = new Quill("#editorBenefitsToHighlight", quillOptions);

const editorDescription = new Quill("#editorDescription", quillOptions);
const editorStyleDescription = new Quill("#editorStyleDescription", quillOptions);
const editorGear = new Quill("#editorGear", quillOptions);

const elStartDate = document.getElementById("startDate");
elStartDate.addEventListener("changeDate", (event) => {
  store.fields.start_date = event.detail.date;
});
const startDatePicker = new Datepicker(elStartDate, {});

const elDueDate = document.getElementById("dueDate");
elDueDate.addEventListener("changeDate", (event) => {
  store.fields.due_date = event.detail.date;
});
const dueDatePicker = new Datepicker(elDueDate, {});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0
});

const store = reactive({
  creativeStyles: [],
  coverImagePreviewUrl: "",
  isWorldwide: false,
  startDateAsap: false,
  dueDateAsap: false,
  fields: {
    title: "",
    description: "",
    budget: "",
    location: "",
    cover_image: [],
    services: [],
    video_inspo: [""],
    image_in  spo: [],
    creative_styles: [],
    style_description: "",
    start_date: new Date(),
    due_date: new Date(),
    deliverable_1: "",
    deliverable_2: "",
    deliverable_3: "",
    deliverable_4: "",
    gear: "",
    service_level: "recXWLp6CM9bxcXvi",
    attachments: []
  }
});

console.log('hi')
const getCreativeStyles = async () => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/63247325f53f9b56f2a69a16",
    {
      method: "GET"
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const mounted = async () => {
  store.creativeStyles = await getCreativeStyles();

  const coverImageWidget = window.uploadcare.Widget(
    '[role=uploadcare-uploader][upload-field-name="cover_image"]'
  );
  coverImageWidget.onChange(function (file) {
    if (file) {
      file.done((info) => {
        // Reset the field as it only supports one image
        store.fields.cover_image = [];
        store.fields.cover_image.push({ url: info.cdnUrl });
        store.coverImagePreviewUrl = info.cdnUrl;
      });
    }
  });

  // get a widget reference
  const imageInspoWidget = window.uploadcare.MultipleWidget(
    '[role=uploadcare-uploader][upload-field-name="image_inspo"]'
  );
  // listen to the "change" event
  imageInspoWidget.onChange(function (group) {
    // get a list of file instances
    group.files().forEach((file) => {
      // once each file is uploaded, get its CDN URL from the fileInfo object
      file.done((fileInfo) => {
        store.fields.image_inspo.push({ url: fileInfo.cdnUrl });
      });
    });
  });

  // get a widget reference
  const attachmentsWidget = window.uploadcare.MultipleWidget(
    '[role=uploadcare-uploader][upload-field-name="attachments"]'
  );
  // listen to the "change" event
  attachmentsWidget.onChange(function (group) {
    // get a list of file instances
    group.files().forEach((file) => {
      // once each file is uploaded, get its CDN URL from the fileInfo object
      file.done((fileInfo) => {
        store.fields.attachments.push({ url: fileInfo.cdnUrl });
      });
    });
  });

  editorDescription.on("text-change", function (delta, oldDelta, source) {
    store.fields.description =
      editorDescription.container.children[0].innerHTML;
  });

  editorStyleDescription.on("text-change", function (delta, oldDelta, source) {
    store.fields.style_description =
      editorStyleDescription.container.children[0].innerHTML;
  });

  editorGear.on("text-change", function (delta, oldDelta, source) {
    store.fields.gear = editorGear.container.children[0].innerHTML;
  });

  window.console.log("Mounted");
};

const budgetUpdated = (evt) => {
  const budgetInput = evt?.target;
  const budgetValue = budgetInput.value;
  budgetInput.value = currencyFormatter
    .format(budgetValue.replaceAll(",", ""))
    .replace("$", "");
  store.fields.budget = budgetValue.replaceAll(",", "");
};

const getBackgroundStyle = (url) => {
  let styles = {};
  if (url !== "") {
    styles = { backgroundImage: `url(${url})` };
  }
  return styles;
};

const addVideoInspo = () => {
  if (store.fields.video_inspo.length < 3) {
    store.fields.video_inspo.push("");
  }
};

const app = createApp({
  // exposed to all expressions
  mounted,
  store,
  WebflowFormComponent,
  getBackgroundStyle,
  addVideoInspo,
  budgetUpdated,

  get getCheckedCreativeStyles() {
    return store.creativeStyles.filter((skill) =>
      store.fields.creative_styles.includes(skill.airtable_id)
    );
  }
});

export { app };
