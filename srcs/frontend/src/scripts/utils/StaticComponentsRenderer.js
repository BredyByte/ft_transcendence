import { Component } from '../Component.js';
import { Navbar } from "../../components/Navbar/Navbar.js";
import { ChatModal } from '../../components/ChatModal/ChatModal.js';
import { languageSelector } from '../../components/LanguageSelector/languageSelector.js';
import routerInstance from '../Router.js'

class StaticComponentsRenderer {
	constructor() {
		this.componentsToRender = [
			{
				instance: null,
				getInstance: () => new Navbar(),
				containerId: 'navbar',
				routesToExclude: ["/login", "/signup", "/auth", "/404", "/pong"]
			},
			{
				instance: null,
				getInstance: () => new ChatModal(),
				containerId: 'chat_modal',
				routesToExclude: ["/login", "/signup", "/auth", "/404"]
			},
			{
				instance: null,
				getInstance: () => new languageSelector (),
				containerId: 'languageSelector',
				routesToExclude: ["/login", "/signup", "/auth", "/404"]
			}
		];
	}

	async render() {
		const currentPath = window.location.pathname.replace(/\/+$/, '');
		const isValidRoute = Object.keys(routerInstance.routes).some(route => {
			const routeRegex = new RegExp(`^${route.replace(/:\w+/g, '[^/]+')}/?$`);
			return routeRegex.test(currentPath);
		});

		for (const component of this.componentsToRender) {
			const container = document.getElementById(component.containerId);
			const shouldRender = isValidRoute && !component.routesToExclude.some(route => {
				const routeRegex = new RegExp(`^${route.replace(/:\w+/g, '[^/]+')}/?$`);
				return routeRegex.test(currentPath);
			});

			if (container) {
				if (shouldRender) {
					if (!container.innerHTML.trim()) {
						if (!component.instance) {
							component.instance = component.getInstance();
						}
						await Component.renderComponent(component.instance, component.containerId);
					}
				} else {
					if (component.instance && typeof component.instance.destroy === 'function') {
						component.instance.destroy();
						component.instance = null;
						container.innerHTML = '';
					}
				}
			} else {
				console.warn(`Container with id "${component.containerId}" not found.`);
			}
		}
	}

	getComponentInstance(componentName) {
		const component = this.componentsToRender.find(
			component => component.instance && component.instance.constructor.name === componentName
		);
		return component ? component.instance : null;
	}
}

export const staticComponentsRenderer = new StaticComponentsRenderer();
