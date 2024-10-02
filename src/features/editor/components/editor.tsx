"use client";

import { fabric } from "fabric";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ResponseType } from "@/features/projects/api/use-get-project";
import { useUpdateProject } from "@/features/projects/api/use-update-project";
import { useGetProject } from "@/features/projects/api/use-get-project";

import {
  ActiveTool,
  selectionDependentTools,
  Narrative,
} from "@/features/editor/types";
import { Navbar } from "@/features/editor/components/navbar";
import { Footer } from "@/features/editor/components/footer";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { Sidebar } from "@/features/editor/components/sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { DrawSidebar } from "@/features/editor/components/draw-sidebar";
import { ContentSidebar } from "@/features/editor/components/content-sidebar";
import { TemplateSidebar } from "@/features/editor/components/template-sidebar";
import { RemoveBgSidebar } from "@/features/editor/components/remove-bg-sidebar";
import { SettingsSidebar } from "@/features/editor/components/settings-sidebar";
import { AiSidebar } from "@/features/editor/components/ai-sidebar";
import EditNarrative from "./edit-narrative";

interface EditorProps {
  initialData: ResponseType["data"];
}

export const Editor = ({ initialData }: EditorProps) => {
  const { mutate } = useUpdateProject(initialData.id);

  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(
    null
  );

  const [isAiEditMode, setIsAiEditMode] = useState(false);
  const [toggleEditNarrative, setToggleEditNarrative] = useState(false);
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [extraAssets, setExtraAssets] = useState<File | null>(null);
  const [refinementLoopSetting, setRefinementLoopSetting] = useState({
    "Critic Agent": true,
    "Planning Agent": true,
    "Execution Agent": true,
    Tools: true,
    "Evaluation Agent": true,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((values: { json: string; height: number; width: number }) => {
      mutate(values);
    }, 500),
    [mutate]
  );

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: JSON.stringify(initialData.json),
    defaultWidth: 832,
    defaultHeight: 1152,
    clearSelectionCallback: onClearSelection,
    saveCallback: debouncedSave,
  });

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (isAiEditMode) {
        if (tool === "ai" || tool === "select") setActiveTool(tool);
        if (tool === activeTool) setActiveTool("select");
        return;
      }
      if (tool === "draw") {
        editor?.enableDrawingMode();
      }

      if (activeTool === "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, editor, isAiEditMode]
  );

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full flex flex-col">
      <Navbar
        id={initialData.id}
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        isAiEditMode={isAiEditMode}
        setIsAiEditMode={setIsAiEditMode}
      />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ContentSidebar
          projectId={initialData.id}
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          generatedContent={generatedContent}
          setGeneratedContent={setGeneratedContent}
          selectedNarrative={selectedNarrative}
          setSelectedNarrative={setSelectedNarrative}
          brandLogo={brandLogo}
          setBrandLogo={setBrandLogo}
          productImage={productImage}
          setProductImage={setProductImage}
          extraAssets={extraAssets}
          setExtraAssets={setExtraAssets}
          setToggleEditNarrative={setToggleEditNarrative}
          setIsAiEditMode={setIsAiEditMode}
          refinementLoopSetting={refinementLoopSetting}
        />
        <RemoveBgSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          projectId={initialData.id}
        />
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          refinementLoopSetting={refinementLoopSetting}
          setRefinementLoopSetting={setRefinementLoopSetting}
        />
        <main className="bg-muted flex-1 overflow-auto relative flex flex-col relative">
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <div
            className="flex-1 h-[calc(100%-124px)] bg-muted"
            ref={containerRef}
          >
            <canvas ref={canvasRef} />
          </div>
          <EditNarrative
            editor={editor}
            projectId={initialData.id}
            selectedNarrative={selectedNarrative}
            setSelectedNarrative={setSelectedNarrative}
            generatedContent={generatedContent}
            brandLogo={brandLogo}
            productImage={productImage}
            extraAssets={extraAssets}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            setIsAiEditMode={setIsAiEditMode}
            setToggleEditNarrative={setToggleEditNarrative}
            toggleEditNarrative={toggleEditNarrative}
            refinementLoopSetting={refinementLoopSetting}
          />
          <Footer editor={editor} />
        </main>
      </div>
    </div>
  );
};
