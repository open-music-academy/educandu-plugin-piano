import PropTypes from "prop-types";
import classNames from "classnames";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from "react";
import DebouncedInput from "@educandu/educandu/components/debounced-input.js";
import { useService } from "@educandu/educandu/components/container-context.js";
import { SOURCE_TYPE } from "@educandu/educandu/domain/constants.js";
import PublicIcon from "@educandu/educandu/components/icons/general/public-icon.js";
import ClientConfig from "@educandu/educandu/bootstrap/client-config.js";
import PrivateIcon from "@educandu/educandu/components/icons/general/private-icon.js";
import { analyzeMediaUrl } from "@educandu/educandu/utils/media-utils.js";
import WikimediaIcon from "@educandu/educandu/components/icons/wikimedia/wikimedia-icon.js";
import { BankOutlined, GlobalOutlined, WarningOutlined, YoutubeOutlined } from "@ant-design/icons";
import ResourceSelectorDialog from "@educandu/educandu/components/resource-selector/resource-selector-dialog.js";
import { getSourceType, getPortableUrl, getAccessibleUrl, createMetadataForSource } from "@educandu/educandu/utils/source-utils.js";
function UrlInput({ value, allowedSourceTypes, disabled, onChange }) {
  const { t } = useTranslation("urlInput");
  const clientConfig = useService(ClientConfig);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const unsecureUrl = value && value.startsWith("http://");
  const sourceType = useMemo(() => {
    const newSourceType = getSourceType({ url: value, cdnRootUrl: clientConfig.cdnRootUrl });
    return allowedSourceTypes.includes(newSourceType) ? newSourceType : SOURCE_TYPE.unsupported;
  }, [clientConfig.cdnRootUrl, value, allowedSourceTypes]);
  const inputPrefixIcon = useMemo(() => {
    switch (sourceType) {
      case SOURCE_TYPE.none:
        return null;
      case SOURCE_TYPE.youtube:
        return /* @__PURE__ */ React.createElement(YoutubeOutlined, null);
      case SOURCE_TYPE.wikimedia:
        return /* @__PURE__ */ React.createElement(WikimediaIcon, null);
      case SOURCE_TYPE.mediaLibrary:
        return /* @__PURE__ */ React.createElement(BankOutlined, null);
      case SOURCE_TYPE.documentMedia:
        return /* @__PURE__ */ React.createElement(PublicIcon, null);
      case SOURCE_TYPE.roomMedia:
        return /* @__PURE__ */ React.createElement(PrivateIcon, null);
      case SOURCE_TYPE.external:
        return unsecureUrl ? /* @__PURE__ */ React.createElement(WarningOutlined, null) : /* @__PURE__ */ React.createElement(GlobalOutlined, null);
      default:
        return /* @__PURE__ */ React.createElement(WarningOutlined, null);
    }
  }, [sourceType, unsecureUrl]);
  const handleInputValueChange = (newValue) => {
    const accessibleUrl = getAccessibleUrl({ url: newValue, cdnRootUrl: clientConfig.cdnRootUrl });
    const { sanitizedUrl } = analyzeMediaUrl(accessibleUrl);
    const portableUrl = getPortableUrl({ url: sanitizedUrl, cdnRootUrl: clientConfig.cdnRootUrl });
    const metadata = createMetadataForSource({ url: portableUrl, cdnRootUrl: clientConfig.cdnRootUrl });
    onChange(portableUrl, metadata);
  };
  const handleDebouncedInputValueChange = (event) => {
    handleInputValueChange(event.target.value);
  };
  const handleSelectButtonClick = () => {
    setIsDialogOpen(true);
  };
  const handleDialogSelect = (newUrl) => {
    handleInputValueChange(newUrl);
    setIsDialogOpen(false);
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };
  const renderInputPrefix = () => {
    const tooltipTitle = `${t("common:source")}: ${t(`tooltip_${sourceType}`)}`;
    const classes2 = classNames(
      "UrlInput-prefix",
      { "UrlInput-prefix--error": sourceType === SOURCE_TYPE.unsupported },
      { "UrlInput-prefix--warning": unsecureUrl }
    );
    return /* @__PURE__ */ React.createElement(Tooltip, { title: tooltipTitle }, /* @__PURE__ */ React.createElement("div", { className: classes2 }, inputPrefixIcon));
  };
  const classes = classNames(
    "UrlInput",
    "u-input-and-button",
    { "UrlInput--warning": unsecureUrl }
  );
  return /* @__PURE__ */ React.createElement("div", { className: classes }, /* @__PURE__ */ React.createElement(
    DebouncedInput,
    {
      value,
      disabled,
      addonBefore: renderInputPrefix(),
      onChange: handleDebouncedInputValueChange
    }
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "primary",
      disabled,
      onClick: handleSelectButtonClick
    },
    t("common:select")
  ), !!unsecureUrl && /* @__PURE__ */ React.createElement("div", { className: "UrlInput-warning" }, t("unsecureUrl")), /* @__PURE__ */ React.createElement(
    ResourceSelectorDialog,
    {
      url: value,
      isOpen: isDialogOpen,
      allowedSourceTypes,
      onSelect: handleDialogSelect,
      onClose: handleDialogClose
    }
  ));
}
UrlInput.propTypes = {
  allowedSourceTypes: PropTypes.arrayOf(PropTypes.oneOf(Object.values(SOURCE_TYPE))),
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};
UrlInput.defaultProps = {
  allowedSourceTypes: Object.values(SOURCE_TYPE),
  disabled: false,
  value: ""
};
var url_input_default = UrlInput;
export {
  url_input_default as default
};
//# sourceMappingURL=url-input.js.map
