"use strict";

// ショートカットキー
// クリック時
chrome.browserAction.onClicked.addListener(activeTab => {
	const targetTabId = activeTab.id;
	chrome.windows.getCurrent({
		populate: true
	}, currentWindow => {
		const rightTabs = currentWindow.tabs.reduce(({rightTabs, isRight}, tab) => {
			// 今のタブより右にあるものを新しいwindowに移動
			if (isRight) rightTabs.push(tab.id);
			if (tab.id === targetTabId) isRight = true;
			return {rightTabs, isRight};
		}, {rightTabs: [], isRight: false}).rightTabs;
		if (rightTabs.length === 0) {
			// 最後のタブの場合、今のタブだけ新しいウィンドウに移動
			rightTabs.push(targetTabId);
		}
		if (rightTabs.length) {
			chrome.windows.create({
				tabId: rightTabs[0],
				top: 0,
				left: 0,
				incognito: currentWindow.incognito
			}, createdWindow => {
				const wId = createdWindow.id;
				chrome.windows.update(wId, {
					state: "maximized"
				});
				chrome.tabs.move(rightTabs, {
					windowId: wId,
					index: -1
				});
			});
		}
	});
});

/***********************************************/


const ID_OPEN_AT_MAIN_DISPLAY = "open-at-main-display";

function createContextMenus() {
	chrome.contextMenus.create({
		title: "リンクを新しいwindowで開く（メインディスプレイ最大化）",
		contexts: ["link"],
		id: ID_OPEN_AT_MAIN_DISPLAY
	});
}

chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.runtime.onStartup.addListener(createContextMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === ID_OPEN_AT_MAIN_DISPLAY) {
		chrome.windows.create({
			url: info.linkUrl,
			top: 0,
			left: 0,
			incognito: tab.incognito
		}, createdWindow => {
			chrome.windows.update(createdWindow.id, {
				state: "maximized"
			});
		});
	}
});
