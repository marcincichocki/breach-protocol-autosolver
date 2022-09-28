import { isJSONObject, JSONValue } from '@/common';
import {
  createContext,
  memo,
  PropsWithChildren,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { LinkButton } from './Buttons';
import { Col } from './Flex';

const Only = ({ when, children }: PropsWithChildren<{ when: boolean }>) => {
  return <>{when ? children : null}</>;
};

type JSONObject = Extract<JSONValue, object>;
type JSONPrimitive = Exclude<JSONValue, object>;

/** Tree control enables interaction with displayed JSON by child components. */
interface JSONTreeControl {
  /** Data used by this tree. */
  readonly root: JSONValue;

  /** Set of objects which are expanded. */
  readonly expansionModel: Set<JSONObject>;

  /** Expands given tree object. */
  expand: (data: JSONObject) => void;

  /** Expands all tree objects. */
  expandAll: () => void;

  /** Collapses given tree object. */
  collapse: (data: JSONObject) => void;

  /** Collapses whole tree. */
  collapseAll: () => void;
}

function forEachObject(data: JSONValue, cb: (data: JSONObject) => void) {
  if (!isJSONObject(data)) {
    return;
  }

  cb(data);

  Object.values(data).forEach((value) => {
    forEachObject(value, cb);
  });
}

export const TreeContext = createContext<JSONTreeControl>(null);

function useTreeControl(root: JSONValue, expanded?: boolean): JSONTreeControl {
  const [expansionModel, setExpansionModel] = useState(new Set<JSONObject>());

  const expand = useCallback((data: JSONObject) => {
    setExpansionModel((model) => new Set(model).add(data));
  }, []);

  const expandAll = useCallback(() => {
    const model = new Set<JSONObject>();

    forEachObject(root, (value) => model.add(value));

    setExpansionModel(model);
  }, [root]);

  const collapse = useCallback((data: JSONObject) => {
    setExpansionModel((model) => {
      const updatedModel = new Set(model);

      updatedModel.delete(data);

      return updatedModel;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpansionModel(new Set());
  }, []);

  useLayoutEffect(() => {
    if (expanded) {
      expandAll();
    } else {
      collapseAll();
    }
  }, [expanded, root]);

  return { root, expand, expandAll, collapse, collapseAll, expansionModel };
}

export type JSONValidator = (value: JSONPrimitive) => boolean;

interface JsonTreeProps {
  /** Data to render. */
  data: JSONValue;

  /** Whether json is expanded initially. */
  expanded?: boolean;

  /** Checks whether value is valid or not. */
  validate?: JSONValidator;

  className?: string;
}

const JSONTreeContainer = styled(Col)`
  border: 1px solid var(--primary);
  background: var(--background);
  position: relative;
  overflow-y: auto;
  flex: 1;
`;

const JSONTreeContent = styled.pre`
  margin: 0;
  overflow-y: auto;
  font-family: Rajdhani;
  font-weight: 500;
  font-size: 1.2rem;
  color: #fff;
  word-break: break-word;
  white-space: pre-line;
  padding: 1rem;
  padding-right: 3rem;
`;

export const JSONTreeActions = styled.aside`
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem;
  gap: 1rem;
  display: flex;
  flex-direction: column;
`;

const TreeValidatorContext = createContext<JSONValidator>(null);

export const JSONTree = memo(
  ({
    data,
    expanded,
    className,
    children,
    validate,
  }: PropsWithChildren<JsonTreeProps>) => {
    const treeControl = useTreeControl(data, expanded);

    return (
      <TreeContext.Provider value={treeControl}>
        <TreeValidatorContext.Provider value={validate}>
          <JSONTreeContainer className={className}>
            <JSONTreeContent>
              <JSONViewerContainer data={data}>
                <JSONViewer data={data} path="root"></JSONViewer>
              </JSONViewerContainer>
            </JSONTreeContent>
            {children}
          </JSONTreeContainer>
        </TreeValidatorContext.Provider>
      </TreeContext.Provider>
    );
  }
);

const JSONPropertyToggle = styled(
  ({ data, className }: { data: JSONObject; className?: string }) => {
    const { expansionModel, expand, collapse } = useContext(TreeContext);
    const expanded = expansionModel.has(data);

    return (
      <button
        className={className}
        type="button"
        onClick={() => (expanded ? collapse(data) : expand(data))}
      >
        {expanded ? '-' : '+'}
      </button>
    );
  }
)`
  border: none;
  background: none;
  color: #fff;
  cursor: pointer;
  font-family: 'Rajdhani';
  user-select: none;
  font-size: 18px;
`;

const JSONNumber = styled.span``;
const JSONBoolean = styled.span``;
const JSONNull = styled.span`
  color: var(--accent-dark);
`;
const JSONString = styled.span`
  color: var(--accent);
`;
const JSONLink = styled(LinkButton)`
  font-size: 18px;
  display: contents;
`;

const primitives: Record<
  string,
  (props: PropsWithChildren<{ className?: string }>) => JSX.Element
> = {
  object: JSONNull,
  number: JSONNumber,
  string: JSONString,
  boolean: JSONBoolean,
};

const pathRe =
  BUILD_PLATFORM === 'win32'
    ? /(^([a-z]|[A-Z]):(?=\\(?![\0-\37<>:"/\\|?*])|\/(?![\0-\37<>:"/\\|?*])|$)|^\\(?=[\\\/][^\0-\37<>:"/\\|?*]+)|^(?=(\\|\/)$)|^\.(?=(\\|\/)$)|^\.\.(?=(\\|\/)$)|^(?=(\\|\/)[^\0-\37<>:"/\\|?*]+)|^\.(?=(\\|\/)[^\0-\37<>:"/\\|?*]+)|^\.\.(?=(\\|\/)[^\0-\37<>:"/\\|?*]+))((\\|\/)[^\0-\37<>:"/\\|?*]+|(\\|\/)$)*()$/
    : /^\/$|(^(?=\/)|^\.|^\.\.)(\/(?=[^/\0])[^/\0]+)*\/?$/;

const JSONPrimitive = memo(({ data }: { data: JSONPrimitive }) => {
  const validate = useContext(TreeValidatorContext);
  const isValid = validate ? validate(data) : true;
  const value = JSON.stringify(data);

  if (typeof data === 'string' && pathRe.test(data)) {
    return (
      <JSONLink onClick={() => api.showItemInFolder(data)}>{value}</JSONLink>
    );
  }

  const Tag = primitives[typeof data];

  return <Tag className={isValid ? 'valid' : 'invalid'}>{value}</Tag>;
});

const JSONProperty = styled(
  ({ property, className }: { property: string; className?: string }) => {
    return (
      <>
        <span className={className}>"{property}"</span>:&nbsp;
      </>
    );
  }
)`
  color: var(--primary);
`;

const brackets: Record<JSONBracketType, [start: string, end: string]> = {
  array: ['[', ']'],
  object: ['{', '}'],
};

type JSONBracketType = 'array' | 'object';

const JSONBracket = ({
  data,
  position,
}: {
  position: 'start' | 'end';
  data: JSONObject;
}) => {
  const type = Array.isArray(data) ? 'array' : 'object';
  const [start, end] = brackets[type];
  const token = position === 'start' ? start : end;

  return <>{token}</>;
};

const JSONViewerContainer = memo(
  ({ data, children }: PropsWithChildren<{ data: JSONValue }>) => {
    const isObject = isJSONObject(data);

    return (
      <>
        <Only when={isObject}>
          <JSONBracket data={data as JSONObject} position="start" />
          <JSONPropertyToggle data={data as JSONObject} />
        </Only>
        {children}
        <Only when={isObject}>
          <JSONBracket data={data as JSONObject} position="end" />
        </Only>
      </>
    );
  }
);

const JSONViewerList = styled.ul`
  margin: 0;
  padding-left: 24px;
`;
const JSONViewerListItem = styled.li`
  list-style: none;
`;

const JSONViewer = memo(
  ({ data, path }: { data: JSONValue; path?: string }) => {
    if (!isJSONObject(data)) {
      return <JSONPrimitive data={data} />;
    }

    const { expansionModel } = useContext(TreeContext);

    if (!expansionModel.has(data)) {
      return null;
    }

    const isArray = Array.isArray(data);
    const entries = Object.entries(data);

    return (
      <JSONViewerList className={path}>
        {entries.map(([property, value], index) => {
          const isLast = index === entries.length - 1;
          const childPath = path ? `${path}-${property}` : property;

          return (
            <JSONViewerListItem key={property}>
              <Only when={!isArray}>
                <JSONProperty property={property} />
              </Only>
              <JSONViewerContainer data={value}>
                <JSONViewer data={value} path={childPath}></JSONViewer>
              </JSONViewerContainer>
              <Only when={!isLast}>,</Only>
            </JSONViewerListItem>
          );
        })}
      </JSONViewerList>
    );
  }
);
