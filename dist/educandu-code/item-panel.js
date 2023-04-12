import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Button, Collapse, Tooltip } from "antd";
import DeleteIcon from "@educandu/educandu/components/icons/general/delete-icon.js";
import MoveUpIcon from "@educandu/educandu/components/icons/general/move-up-icon.js";
import MoveDownIcon from "@educandu/educandu/components/icons/general/move-down-icon.js";
import { confirmDeleteItem } from "@educandu/educandu/components/confirmation-dialogs.js";
function ItemPanel({
  index,
  header,
  children,
  dragHandleProps,
  isDragged,
  isOtherDragged,
  itemsCount,
  canDeleteLastItem,
  extraActionButtons,
  onMoveUp,
  onMoveDown,
  onDelete,
  onExtraActionButtonClick
}) {
  const { t } = useTranslation();
  const handleActionButtonWrapperClick = (event, actionButton) => {
    if (actionButton.disabled) {
      event.stopPropagation();
    }
  };
  const handleActionButtonClick = (event, actionButton) => {
    event.stopPropagation();
    switch (actionButton.key) {
      case "moveUp":
        return onMoveUp(index);
      case "moveDown":
        return onMoveDown(index);
      case "delete":
        return confirmDeleteItem(t, header, () => onDelete(index));
      default:
        return onExtraActionButtonClick(actionButton.key);
    }
  };
  const actionButtons = [];
  if (onMoveUp) {
    actionButtons.push({
      key: "moveUp",
      title: t("common:moveUp"),
      icon: /* @__PURE__ */ React.createElement(MoveUpIcon, null),
      disabled: index === 0
    });
  }
  if (onMoveDown) {
    actionButtons.push({
      key: "moveDown",
      title: t("common:moveDown"),
      icon: /* @__PURE__ */ React.createElement(MoveDownIcon, null),
      disabled: index === itemsCount - 1
    });
  }
  if (onDelete) {
    const isDeleteDisabled = !canDeleteLastItem && itemsCount <= 1;
    actionButtons.push({
      key: "delete",
      title: t("common:delete"),
      icon: /* @__PURE__ */ React.createElement(DeleteIcon, null),
      danger: !isDeleteDisabled,
      disabled: isDeleteDisabled
    });
  }
  actionButtons.push(...extraActionButtons);
  const renderActionButtons = () => {
    if (!actionButtons.length) {
      return null;
    }
    return /* @__PURE__ */ React.createElement("div", { className: "ItemPanel-actionButtons" }, actionButtons.map((actionButton) => /* @__PURE__ */ React.createElement("div", { key: actionButton.key, onClick: (event) => handleActionButtonWrapperClick(event, actionButton) }, /* @__PURE__ */ React.createElement(Tooltip, { title: actionButton.title }, /* @__PURE__ */ React.createElement(
      Button,
      {
        type: "text",
        size: "small",
        icon: actionButton.icon,
        disabled: actionButton.disabled,
        className: classNames("u-action-button", { "u-danger-action-button": actionButton.danger }),
        onClick: (event) => handleActionButtonClick(event, actionButton)
      }
    )))));
  };
  return /* @__PURE__ */ React.createElement(Collapse, { collapsible: "icon", className: classNames("ItemPanel", { "is-dragged": isDragged, "is-other-dragged": isOtherDragged }), defaultActiveKey: "panel" }, /* @__PURE__ */ React.createElement(
    Collapse.Panel,
    {
      key: "panel",
      header: /* @__PURE__ */ React.createElement("div", { ...dragHandleProps, className: "ItemPanel-header" }, header),
      extra: renderActionButtons()
    },
    /* @__PURE__ */ React.createElement("div", { className: "ItemPanel-contentWrapper" }, children)
  ));
}
ItemPanel.propTypes = {
  canDeleteLastItem: PropTypes.bool,
  children: PropTypes.node.isRequired,
  extraActionButtons: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    danger: PropTypes.bool,
    disabled: PropTypes.bool
  })),
  header: PropTypes.string,
  index: PropTypes.number,
  dragHandleProps: PropTypes.object,
  isDragged: PropTypes.bool,
  isOtherDragged: PropTypes.bool,
  itemsCount: PropTypes.number,
  onDelete: PropTypes.func,
  onExtraActionButtonClick: PropTypes.func,
  onMoveDown: PropTypes.func,
  onMoveUp: PropTypes.func
};
ItemPanel.defaultProps = {
  canDeleteLastItem: false,
  extraActionButtons: [],
  header: "",
  index: 0,
  dragHandleProps: null,
  isDragged: false,
  isOtherDragged: false,
  itemsCount: 1,
  onDelete: null,
  onExtraActionButtonClick: () => {
  },
  onMoveDown: null,
  onMoveUp: null
};
var item_panel_default = ItemPanel;
export {
  item_panel_default as default
};
//# sourceMappingURL=item-panel.js.map
